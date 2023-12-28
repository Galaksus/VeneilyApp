const nameDialog = document.getElementById("name-dialog");
const nameInput = document.getElementById("name-input");
const cancelButton = document.getElementById("name-cancel-button");
const okButton = document.getElementById("name-ok-button");

var routeType = ""; // Need to be global

// Save to Db on button click
function SaveButtonFunction() {
  // routeType is route if polyline and loop if polygon on map
  routeType = drawMode === 'polyline' ? 'Route' : 'Loop';

 console.log(routeType);
   // 
    nameDialog.style.display = "block"; // Shows name dialog
    nameInput.focus(); // Focus cursor on the input field
  
    // Toinen homma voisi olla että sen routen nimeksi ei vosi antaa liian pitkää nimeä!
    window.refreshSelectElement(false);
    SaveButton.disabled = true;
  }
SaveButton.addEventListener("click", SaveButtonFunction);
  
cancelButton.addEventListener("click", () => {
    nameInput.value = ""; // Clear input field
    nameDialog.style.display = "none";
    SaveButton.disabled = false;

});

// Function to get latlng of all markers
function getMarkersLatLngAsString() {
  var latlngArray = markers.map(function(marker) {
    return marker.getLatLng();
  });
  return latlngArray.toString();
}

okButton.addEventListener("click", () => {
    const newName = nameInput.value;
    // Check if the given name is <= 15 characters
    if (newName.length <= 15) {
      console.log("Entered name: " + newName);

      nameInput.value = ""; // Clear input field
      nameDialog.style.display = "none";

      var latlngs = getMarkersLatLngAsString();
console.log(latlngs);
      // Calls the Java interface where the data will be stored to database
      window.Android.newRouteCreated(latlngs, routeType, newName);
      refreshSelectElement(false); // Refreshes the select element by recreating the script

      ResetButtonFunction(); // closes the route creation tool
      NewRouteButton.click();
  } else {
      console.log("Name must be at most 15 characters long.");
      // Update input field placeholder text
      nameInput.value = ""; // Clear input field

      nameInput.placeholder = "Max 15 characters";
  }



});