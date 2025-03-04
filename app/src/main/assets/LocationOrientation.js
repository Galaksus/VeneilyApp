/* File that contains functions related to positioning of the map and rotating the orientation arrow */
const centerMeButton = document.getElementById("center-me-button");
const centerMeButtonSrc = document.getElementById("center-me-button-src");


var isFirstRun = true; // This is for 
let centerMeButtonToggled = false;
let angle; // Angle of the orientation arrow
var customMarker; // This is the orientation arrow
var previousLocation = null;
// Variable to store the polyline and anchorMarker
var lockModePolyline;
var anchorMarker;

centerMeButton.addEventListener("click", function () {
    centerMeButtonToggled = !centerMeButtonToggled;
    if (centerMeButtonToggled) {
      // gets currentLocation and then Java calls the setViewOnCurrentLocation() here in JS
      //Android.getCurrentLocation(); // TODO TÄMÄ KUNTOON
      //var currentLatLng = customMarker.getLatLng();
      //drawCircleOnCurrentLocationOnMap(currentLatLng.lat,  currentLatLng.lng);
  
      centerMeButtonSrc.src = "icons/center-me-active.svg"
      if (previousLocation) {
        setViewOnCurrentLocation(previousLocation.latitude, previousLocation.longitude); // set location to the previous location
      }

    } else {
      centerMeButtonSrc.src = "icons/center-me-normal.svg"
    }
  });

let globalLockModeCoordinates; // used with TestData.js

function drawLockModeLine(coordianteString) {
  console.log("coordianteString", coordianteString);

  // Parse the coordinate string into latitude and longitude
  var coords = coordianteString.split(',');
  var lat = parseFloat(coords[0]);
  var lon = parseFloat(coords[1]);

  // Create a new LatLng object from the parsed coordinates
  var targetLatLng = L.latLng(lat, lon);

  // Create a polyline between the custom marker and the target coordinates
  lockModePolyline = L.polyline([customMarker.getLatLng(), targetLatLng], { color: 'red' }).addTo(map);

  // Save the lock mode coordinates for further use of testData database
  let latLng = customMarker.getLatLng();
  globalLockModeCoordinates = `${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}` + "," + coordianteString;
}

// Function to remove the line
function removeLine() {
  if (lockModePolyline) {
    map.removeLayer(lockModePolyline);
    lockModePolyline = null;
  }
}

function drawAnchorMarker() {
  let initialLatLng = customMarker.getLatLng();
  let changed = false;

  // Set up the 2-second timeout
  let timeoutId = setTimeout(function () {
    let finalLatLng = changed ? customMarker.getLatLng() : initialLatLng;
    anchorMarker = L.marker(finalLatLng).addTo(map);
    anchorMarker.bindPopup('This is the anchor marker.');

    // Add event listener for when the popup is opened
    anchorMarker.on('popupopen', function () {
      // Calculate the distance between anchorMarker and customMarker
      let anchorLatLng = anchorMarker.getLatLng();
      let customLatLng = customMarker.getLatLng();
      let distance = anchorLatLng.distanceTo(customLatLng);

      console.log('Popup opened at:', anchorLatLng);
      console.log('Distance between anchorMarker and customMarker:', distance, 'meters');

      // Update the popup content with the distance
      this.setPopupContent(`This is the anchor marker. Distance to current location: ${distance.toFixed(2)} meters.`);
    });

    console.log('Anchor marker added at:', finalLatLng);
  }, 2000);

  // Event listener for marker position change
  customMarker.on('move', function () {
    if (!changed) {
      changed = true;
      clearTimeout(timeoutId); // Cancel the 2-second timer

      // Add the anchor marker immediately at the new position
      let finalLatLng = customMarker.getLatLng();
      anchorMarker = L.marker(finalLatLng).addTo(map);
      anchorMarker.bindPopup('This is the anchor marker.');

      // Add event listener for when the popup is opened
      anchorMarker.on('popupopen', function () {
        // Calculate the distance between anchorMarker and customMarker
        let anchorLatLng = anchorMarker.getLatLng();
        let customLatLng = customMarker.getLatLng();
        let distance = anchorLatLng.distanceTo(customLatLng);

        console.log('Popup opened at:', anchorLatLng);
        console.log('Distance between anchorMarker and customMarker:', distance, 'meters');

        // Update the popup content with the distance
        this.setPopupContent(`This is the anchor marker. Distance to current location: ${distance.toFixed(2)} meters.`);
      });

      console.log('Anchor marker added immediately at:', finalLatLng);
    }
  });
}

// Function to remove the anchorMarker
function removeAnchorMarker() {
  if (anchorMarker) {
    map.removeLayer(anchorMarker);
    anchorMarker = null;
  }
}

function moveMapView(coordinatesPairs, currentIndex) {
  clearMap();
  // Create an array to store LatLng objects for each marker
  var markerLatLngs = [];

// Add markers to the map and populate the markerLatLngs array
for (let i = 0; i < coordinatesPairs.length; i++) {
  var latlng = coordinatesPairs[i];
  var myMarker = L.marker(latlng).addTo(map);
  
  // Create the popup content
  var popupContent = `Index: ${i}, Coordinate: ${latlng[0]}, ${latlng[1]}`;
  
  // Bind the popup to the marker
  myMarker.bindPopup(popupContent);
  
  // Add the marker's LatLng to the markerLatLngs array
  markerLatLngs.push(myMarker.getLatLng());
}


  let marginPercentage = 0.1;
  // Calculate bounds with margin
  var bounds = new L.LatLngBounds(markerLatLngs);
  bounds = bounds.pad(marginPercentage);

  // fitBounds to set the map view to contain all markers with a margin
  map.fitBounds(bounds);

  // Draw polygon or polyline
  // Eli tää onki niin että tässä luetaan databasesta onko polygon vai polyine
  // Retrieves only last column from database from the desired ID (row)
  var onlyLastColumn = true;
  var routeType = window.Android.getData(parseInt(currentIndex), onlyLastColumn); 
  if (routeType.startsWith("Loop")) {
    L.polygon(coordinatesPairs, {
      color: "blue",
    }).addTo(map);
  } else if (routeType.startsWith("Route")) {
    L.polyline(coordinatesPairs, {
      color: "green",
    }).addTo(map);

  }
}

function drawCircleOnCurrentLocationOnMap(latitude, longitude) {
    /*
     - Better name for this function could be updateCustomMarkerLocationOnMap, but had issues with changing name so it is this for now.
     * Updates custom marker a.k.a the marker that is the orietation arrow
     * This function is fired periodically when current location is updated
     */
    // on startup (first time running this function) center location to current location
  
    previousLocation = {
      latitude: latitude,
      longitude: longitude
  };

    // Check if the marker already exists on the map
    if (isFirstRun) {
      setViewOnCurrentLocation(latitude, longitude); // set location to current location
      var customIcon = L.divIcon({
        className: 'custom-icon-class',
        iconSize: [30, 30], // Size of the icon
        iconAnchor: [15, 15], // Center of the arrow (half of the icon size)
        html: '<img src="icons/location-arrow.svg" style="width: 100%; height: 100%; transform-origin: 50% 50%;">'
      });

      customMarker = L.marker([latitude, longitude], { icon: customIcon}).addTo(map); // add to map on first run
      isFirstRun = false; // First run is now false
    }
  
    customMarker.setLatLng([latitude, longitude]); // Update location on all other runs
  
    // If center me button is active set view to current location
    if (centerMeButtonToggled) {
      setViewOnCurrentLocation(latitude, longitude);
    }
  }
  
  // Rotates the orientationIcon in the map according to current orientation called from javascript interface
  function setMarkerRotation(angle) {
    var newIcon = L.divIcon({
        className: 'custom-icon-class',
        iconSize: [30, 30], // Size of the icon
        iconAnchor: [15, 15], // Center of the arrow (half of the icon size)
        html: '<img src="icons/location-arrow.svg" style="width: 100%; height: 100%; transform-origin: 50% 50%; transform: rotate(' + angle + 'deg);">'
    });
  
    if (customMarker) {
        customMarker.setIcon(newIcon);
    } else {
        // Let's not print anything as it clutters the console output on startup.
        //console.error("customMarker is undefined or not yet initialized.");
    }
  }
  
  function setViewOnCurrentLocation(latitude, longitude) {
    /*
     * Centers the mapview on the current location
     * This function is fired when user clicks "center me" -button on the UI
     */
    // Set the view of the map and zoom level to 14 if it is smaller than that initially
    if (map.getZoom() < 14) {
      map.setView([latitude, longitude], 14);
    } else {
      map.setView([latitude, longitude]);
    }
  }