var markers = []; // arrays to store markers
const deleteButton = document.getElementById("delete-button");
const routesSelect = document.getElementById("routes");
const NewRouteButton = document.getElementById("new-route-button");
const newRouteContainer = document.getElementById("new-route-container");
const RevertButton = document.getElementById("revert-button");
const ResetButton = document.getElementById("reset-button");
const DrawButton = document.getElementById("draw-button");
const SaveButton = document.getElementById("save-button");
const DeleteDraggableMarker = document.getElementById("delete-draggable-marker");

var markersEnabled = false;
var polyline, polygon;
var drawMode = 'polyline'; 

// Add OpenStreetMap tile
var map = L.map("map", {
  zoomSnap: 0.1, // Add the zoomSnap option here
}).setView([63.51501, 26.27171], 4); // Sets view to Tampere initially
//}).setView([61.49911, 23.78712], 11); // Sets view to Tampere initially

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Add also OpenSeaMap tile in top of OpenStreetMap tile
/*L.tileLayer('http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://www.openseamap.org/">OpenSeaMap</a>',
    maxZoom: 18,
    opacity: 0.75
}).addTo(map);*/




function NewRouteButtonFunction() {
  DrawButton.disabled = true;
  SaveButton.disabled = true;

  if (getComputedStyle(newRouteContainer).display !== "none") {
    newRouteContainer.style.display = "none"; // Hide the element
    markersEnabled = false;
  } else {
    newRouteContainer.style.display = "grid"; // Show the element
    markersEnabled = true;
  }

  routesSelect.value = "option1"; // Change select element option to default
  deleteButton.style.display = "none";
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
        DeleteDraggableMarker.style.width = "38px"; // Set your desired width
        DeleteDraggableMarker.style.height = "38px"; // Set your desired height
          });
      marker.on("drag", function () {
        // Just to update the polylines/polygon 
        updateDrawing();
        var markerLatLng = marker.getLatLng();


        // Check if the marker is over the SVG element 
        if (isMarkerOnTop(markerLatLng, DeleteDraggableMarker)) {
          console.log("Moi12");
          DeleteDraggableMarker.style.width = "50px"; // Set your desired width
          DeleteDraggableMarker.style.height = "50px"; // Set your desired height
          }
        else {
          DeleteDraggableMarker.style.width = "38px"; // Set your desired width
          DeleteDraggableMarker.style.height = "38px"; // Set your desired height
        }
      });
      marker.on("dragend", function () {
        updateDrawing();
        var markerLatLng = marker.getLatLng();

        // Check if the marker is over the SVG element 
        if (isMarkerOnTop(markerLatLng, DeleteDraggableMarker)) {
          // Remove the marker from the map
          map.removeLayer(marker);
          // Remove the marker from the array
          var markerIndex = markers.indexOf(marker);
          if (markerIndex !== -1) {
            markers.splice(markerIndex, 1);
            updateDrawing();
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
NewRouteButton.addEventListener("click", NewRouteButtonFunction);
// Function to check if the marker is over the SVG element
function isMarkerOnTop(markerLatLng, svgElement) {
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
  drawMode = (drawMode === 'polyline') ? 'polygon' : 'polyline';
  updateDrawing();
}

DrawButton.addEventListener("click", DrawButtonFunction);

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
  // Route can be saved only if there is 2 or more markers on the map
  SaveButton.disabled = false; 

  }
  // draButton is avaialble if there is 3 or more markers on map
  DrawButton.disabled = (markers.length >= 3) ? false : true;

}

function RevertButtonFunction() {
  if (markers.length > 0) {
    var lastMarker = markers.pop();
    map.removeLayer(lastMarker);
    updateDrawing();
  } else if (polyline || polygon) {
    map.removeLayer(polyline || polygon);
  }
}

RevertButton.addEventListener("click", RevertButtonFunction);

function ResetButtonFunction() {
  clearMap();
  DrawButton.disabled = true;
  SaveButton.disabled = true; 
}
ResetButton.addEventListener("click", ResetButtonFunction);



// Add event listener to select element
routesSelect.addEventListener("change", function () {
  var selectedOption = routesSelect.options[routesSelect.selectedIndex];
  var optionName = selectedOption.text;
  var optionValue = selectedOption.value;
  var currentIndex = routesSelect.selectedIndex;
  //  This is used to hide the "New route" features if not default option selected

  if (optionName !== "Old routes") {
    getTotalLengthOfRoute();
    deleteButton.style.display = "block";
    // saved route is now drawn to map so other markers are cleared
    if (markersEnabled) {
      NewRouteButton.click();
    }
  } else {
    deleteButton.style.display = "none";
  }

  // split the optionValue and get the first coordinate pair from there
  var newMapLocation = optionValue.split(",");
  if (newMapLocation.length > 1) {
    var coordinatesArray = optionValue.split(",").map((str) => str.trim());
    var coordinatesPairs = [];
    for (let i = 0; i < coordinatesArray.length; i += 2) {
      const lat = parseFloat(coordinatesArray[i]);
      const lng = parseFloat(coordinatesArray[i + 1]);
      coordinatesPairs.push([lat, lng]);
    }
    moveMapView(coordinatesPairs, currentIndex);

    // Set route datas to the auto mode dialog page
    document.getElementById("dynamicText-route-name").textContent = optionName;
    document.getElementById("dynamicText-type").textContent = window.Android.getData(currentIndex, true);
    //document.getElementById("dynamicText-type").textContent = ;

    document.getElementById("dynamicText-total-length").textContent = getTotalLengthOfRoute() + " m";
    document.getElementById("dynamicText-checkpoints").textContent = getMarkersOnMapCount(true);
    //document.getElementById("dynamicText-completed").textContent = ; // Not implemented yet

  } else clearMap();
});

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
  var selectedOption = routesSelect.options[routesSelect.selectedIndex];
  var optionName = selectedOption.text;
  return optionName;
}

function getTotalLengthOfRoute() {
  /*
    * Function that calculates the total distance between all points in currently selected route
    returns the total distance with two decimals
    */
  var selectedOption = routesSelect.options[routesSelect.selectedIndex];
  var optionValue = selectedOption.value;
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

function setEnableStateRoutesElement() {
  // Toggles enable/disable of routesSelect
  routesSelect.disabled = !routesSelect.disabled;
}
