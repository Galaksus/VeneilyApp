var markers = []; // arrays to store markers
const deleteButton = document.getElementById("delete-button");
const routesSelect = document.getElementById("routes");
//const routesSelect = document.getElementById("custom-dropdown");

//const NewRouteButton = document.getElementById("new-route-button");
const newRouteContainer = document.getElementById("new-route-container");
const DeleteDraggableMarker = document.getElementById("delete-draggable-marker");
let drawButtonImage = document.querySelector('[alt="Route type Icon"]');
let newRouteImage = document.querySelector('[alt="New route"]');


var markersEnabled = false;
var polyline, polygon;
var drawMode = 'polyline'; 

var currentIndex = 0; // The index of selected route

// Add OpenStreetMap tile
var map = L.map("map", {
  zoomSnap: 0.1,
  attributionControl: false, // Disable the default attribution control
}).setView([63.51501, 26.27171], 4);

// Add OpenStreetMap tile layer with custom attribution
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Create a custom attribution control and add it to the map
var customAttribution = L.control.attribution({
  position: 'topright', // You can change the position here (e.g., 'topleft', 'bottomright', 'bottomleft')
});

customAttribution.addTo(map);
// Add also OpenSeaMap tile in top of OpenStreetMap tile
/*L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://www.openseamap.org/">OpenSeaMap</a>',
    maxZoom: 18,
    opacity: 0.75
}).addTo(map);*/


function NewRouteButtonFunction() {
  updateDrawButtonIcon();
  // Get all the SVG buttons
  var svgButtons = document.querySelectorAll(".svg-button");

  // Loop through each button and show/hide them accordingly
  svgButtons.forEach(function (button) {
    if (button.id === "delete-button") {
      button.style.display = "none";
    }
    else if (button.id === "new-route-button") {
      button.style.display = "flex"; // Display the clicked button
      if (markersEnabled) { // Changes the icon for the button
        newRouteImage.src = "icons/new-black.svg";
        document.getElementById("new-route-text").textContent = "New route";
      } else {
        newRouteImage.src = "icons/go-back.svg";
        document.getElementById("new-route-text").textContent = "Back to main page";
      }
    }
    else {
      // Check if the button was initially visible or hidden
      var initiallyVisible = window.getComputedStyle(button).display === "flex";
     // newRouteImage = "icons/new-black.svg";
      if (initiallyVisible) {
        button.style.display = "none"; // Hide other initially visible buttons
      markersEnabled = false;
      } else {
        button.style.display = "flex"; // Show other initially hidden buttons
      markersEnabled = true;
      }
    }
  });

  clearMap();

  if (markersEnabled) {
    map.on("click", function (event) {
      var marker = L.marker(event.latlng, { draggable: true });
      marker.addTo(map);
      markers.push(marker);

      // Event listener for Leaflet dragging start
      marker.on("dragstart", function () {
        // Show the SVG icon
        DeleteDraggableMarker.style.display = "block";
        // Set the new size of the DeleteDraggableMarker
        DeleteDraggableMarker.style.width = "38px"; 
        DeleteDraggableMarker.style.height = "38px";
      });
      marker.on("drag", function () {
        // Just to update the polylines/polygon
        updateDrawing();
        var markerLatLng = marker.getLatLng();

        // Check if the marker is over the SVG element
        if (isMarkerOnTop(markerLatLng)) {
          DeleteDraggableMarker.style.width = "50px"; 
          DeleteDraggableMarker.style.height = "50px";
        } else {
          DeleteDraggableMarker.style.width = "38px";
          DeleteDraggableMarker.style.height = "38px"; 
        }
      });

      marker.on("dragend", function () {
        updateDrawing();
        var markerLatLng = marker.getLatLng();

        // Check if the marker is over the SVG element
        if (isMarkerOnTop(markerLatLng)) {
          // Remove the marker from the map
          map.removeLayer(marker);
          // Remove the marker from the array
          var markerIndex = markers.indexOf(marker);
          if (markerIndex !== -1) {
            markers.splice(markerIndex, 1);
            updateDrawing();
            updateDrawButtonIcon();
          }
        }
        DeleteDraggableMarker.style.display = "none";
      });

      updateDrawing();
    });
  } else {
    map.off("click"); // Turn off the click event
  }
}

function updateDrawButtonIcon() {
  if (markers.length < 3) {
    drawButtonImage.src = "icons/route-type-path.svg";
    document.getElementById("path-type").textContent = "Type: path"
  }
}

// Function to check if the marker is over the SVG element
function isMarkerOnTop(markerLatLng) {
  var DeleteDraggableMarkergBounds = DeleteDraggableMarker.getBoundingClientRect();

  var point = map.latLngToContainerPoint(markerLatLng);
  var x = point.x;
  var y = point.y;

  return x >= DeleteDraggableMarkergBounds.left &&
         x <= DeleteDraggableMarkergBounds.right &&
         y >= DeleteDraggableMarkergBounds.top &&
         y <= DeleteDraggableMarkergBounds.bottom;
}

function DrawButtonFunction() {
  // Toggle between 'polyline' and 'polygon' modes
  if (drawMode === 'polyline') {
    drawMode = 'polygon';
    drawButtonImage.src = "icons/route-type-loop.svg";
    document.getElementById("path-type").textContent = "Type: loop"
  } else {
    drawMode = 'polyline';
    drawButtonImage.src = "icons/route-type-path.svg";
    document.getElementById("path-type").textContent = "Type: path"

  }
  
  updateDrawing();
}


function drawPolyline(latlngs) {
  polyline = L.polyline(latlngs, { color: 'green' }).addTo(map);
}

function drawPolygon(latlngs) {
  if (latlngs.length >= 3) { // Check if there are three or more markers
    polygon = L.polygon(latlngs, { color: 'blue' }).addTo(map);
  } else {
    drawMode = 'polyline'; // Switch back to polyline mode if not enough markers for polygon
    updateDrawing();
    console.log('Please add three or more markers to draw a polygon.');
  }
}

function updateDrawing() {
  if (polyline) {
    map.removeLayer(polyline);
  }
  if (polygon) {
    map.removeLayer(polygon);
  }
  if (markers.length >= 2) {
    var latlngs = markers.map(function(marker) {
      return marker.getLatLng();
    });

    if (drawMode === 'polyline') {
      drawPolyline(latlngs);
    } else if (drawMode === 'polygon') {
      drawPolygon(latlngs);
    }

  }
  // draButton is avaialble if there is 3 or more markers on map
  //DrawButton.disabled = (markers.length >= 3) ? false : true;

  const SaveButton = document.getElementById("save-button");
  const DrawButton = document.getElementById("draw-button");
  if (markers.length >= 2) { // Save button clickable if >= 2 markers on map
    SaveButton.style.pointerEvents = "auto"; // Enable pointer events
  }
  else {
    SaveButton.style.pointerEvents = "none"; // Disable pointer events

  }
  if (markers.length >= 3) { // Draw button clickable if >= 3 markers on map
    DrawButton.style.pointerEvents = "auto"; // Enable pointer events

  }
  else {
    DrawButton.style.pointerEvents = "none"; // Disable pointer events
  }

}

function RevertButtonFunction() {
  if (markers.length > 0) {
    var lastMarker = markers.pop();
    map.removeLayer(lastMarker);
    updateDrawing();
  } else if (polyline || polygon) {
    map.removeLayer(polyline || polygon);
  }

  updateDrawButtonIcon();
}

function ResetButtonFunction() {
  clearMap();
}

function clearMap() {
  // Remove array elements
  markers.length = 0;
  //remove Marker, Polygon and Polyline layers from the map

  map.eachLayer(function (layer) {
    if (
      (layer instanceof L.Marker ||
      layer instanceof L.Polygon ||
      layer instanceof L.Polyline) &&
      layer !== customMarker // doesn't remove orientation marker
    ) {
      map.removeLayer(layer);
    }
  });
}


function onZoomEnd() {
  // Your code to be executed when the zoom level changes
  // window.Android.getValueFromJava("Zoom level changed!");
  // Tämä ei ole vissiin käytössä tällä hetkellä
}

// Add an event listener for the 'zoomend' event
map.on("zoomend", onZoomEnd);

function getRouteOptionName() {
  /*
   * Returns boolean value according to if route is selected from the Routes select HTML element
   */
  window.android.getData(selectedIndex, "title") // second parameter is column name of the database
  var optionName = selectedOption.text;
  return optionName;
}

function getTotalLengthOfRoute(coordinates) {
  /*
    * Function that calculates the total distance between all points in currently selected route
    returns the total distance with two decimals
    */
 // var selectedOption = routesSelect.options[routesSelect.selectedIndex];
  var optionValue = coordinates;
  // Split the string into an array of latitude and longitude pairs
  var markerPairs = optionValue.split(",");

  // Initialize an array to store LatLng objects
  var latLngArray = [];

  // Loop through the marker pairs and create LatLng objects
  for (var i = 0; i < markerPairs.length; i += 2) {
    var lat = parseFloat(markerPairs[i]);
    var lng = parseFloat(markerPairs[i + 1]);
    var latLng = L.latLng(lat, lng);
    latLngArray.push(latLng);
  }

  // Calculate the total distance between all markers
  var totalDistance = 0;

  for (var j = 0; j < latLngArray.length - 1; j++) {
    var distance = latLngArray[j].distanceTo(latLngArray[j + 1]);
    totalDistance += distance;
  }

  console.log(
    "Total distance between all markers:",
    totalDistance.toFixed(2),
    "meters"
  );
  return parseInt(totalDistance.toFixed(2));
}

function getMarkersOnMapCount(markersOnly) {
  /*
   * Function that counts how many markers are currently in map
   * If called with true parameter:
   * it returns empty if "MarkersEnabled" as that suggests new Route is being drawn by user
   * If called with false parameter:
   * returns string of marker points in the map
   */
  if (markersEnabled) {
    return;
  }
  var layers = map._layers;
  var markerCount = 0;
  var makersOnMapArray = "";

  for (var layerId in layers) {
    var layer = layers[layerId];

    if (layer instanceof L.Marker) {
      // increase counter
      markerCount++;
      // Adds only coordinates of the markers on the map to the array
      var markerData = layer.getLatLng().lat + "," + layer.getLatLng().lng;
      makersOnMapArray +=
        makersOnMapArray === "" ? markerData : "," + markerData;
    }
  }

  console.log("Number of markers:", markerCount);

  if (markersOnly) {
    return markerCount;
  } else {
    return makersOnMapArray;
  }
}

function highlightMarkerOnMap(coordinate) {
  // Split the coordinate string into latitude and longitude
  var coordinates = coordinate.split(",");
  var textToDisplay = "This is the next checkpoint";
  // Convert latitude and longitude to numbers
  var latitude = parseFloat(coordinates[0]);
  var longitude = parseFloat(coordinates[1]);

  // Check if a marker with the same coordinate exists
  var existingMarker = findMarkerByCoordinates(latitude, longitude);

  if (existingMarker) {
    // If a marker exists, attach the popup to it
    existingMarker.bindPopup(textToDisplay).openPopup();
  } else {
    // If no marker exists, create a new marker and attach the popup
    var marker = L.marker([latitude, longitude]).addTo(map);
    marker.bindPopup(textToDisplay).openPopup();
  }
  // Set view there
  // Set the view of the map
  map.setView([latitude, longitude]);
  map.setZoom(14);
}

// Helper function to find a marker by coordinates
function findMarkerByCoordinates(latitude, longitude) {
  // Loop through all markers on the map
  for (var i = 0; i < map._layers.length; i++) {
    var layer = map._layers[i];

    // Check if the layer is a marker and has the same coordinates
    if (
      layer instanceof L.Marker &&
      layer.getLatLng().lat === latitude &&
      layer.getLatLng().lng === longitude
    ) {
      return layer; // Return the marker if found
    }
  }

  return null; // Return null if no marker is found
}

// Closes popups on the map
function removePopupFromMap() {
  map.closePopup();
}

function distanceBetweenCurrentLocationAndNextCoordinate(
  currentLocation,
  nextMarkerCoordinate
) {
  var currentLatLng = L.latLng(parseCoordinate(currentLocation));
  var nextLatLng = L.latLng(parseCoordinate(nextMarkerCoordinate));
  var distance = currentLatLng.distanceTo(nextLatLng);

  return distance.toFixed(2);
}

function parseCoordinate(coordinateString) {
  var coordinateArray = coordinateString.split(",");
  var lat = parseFloat(coordinateArray[0].trim());
  var lng = parseFloat(coordinateArray[1].trim());
  return [lat, lng];
}



/*
function setEnableStateRoutesElement() {
  // Toggles enable/disable of routesSelect
 // routesSelect.disabled = !routesSelect.disabled;
}*/
