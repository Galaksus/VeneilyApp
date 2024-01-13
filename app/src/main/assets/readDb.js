var arrCoordinates = [];
var arrDropdownOptionNames = [];

function createDropdownOptions() {
  console.log("moi1");
  // Clear all existing div elements inside the dropdown content div
  var dropdownContent = document.getElementById("dropdown-dialog-content");
  dropdownContent.innerHTML = "";
  // Remove all child elements
document.querySelectorAll(".option-div-styles").forEach(function (el) {
  el.remove();
});

  // Store the currently selected div
  let selectedDiv = null;

  // Create default div
  const defaultDiv = document.createElement("div");
  defaultDiv.className = "option-div-styles";
  defaultDiv.innerHTML = "default";

  // Add an event listener to change background color on click for the default div
  defaultDiv.addEventListener("click", function () {
    setSelectedDiv(defaultDiv);
  });

  dropdownContent.appendChild(defaultDiv);

  // Get element by id and create as many dropdown divs as there are elements in the array
  for (let i = 0; i < arrDropdownOptionNames.length; i++) {
    const div = document.createElement("div");
    div.className = "option-div-styles";
    div.innerHTML = arrDropdownOptionNames[i];
    div.setAttribute("data-coordinates", arrCoordinates[i].join(","));

    // Add an event listener to change background color on click
    div.addEventListener("click", function () {
      setSelectedDiv(div);
    });

    dropdownContent.appendChild(div);
  }

  // Function to set the selected div and update background colors
  function setSelectedDiv(newSelectedDiv) {
    // Remove background color from all divs
    var allDivs = document.getElementsByClassName("option-div-styles");
    for (let j = 0; j < allDivs.length; j++) {
      allDivs[j].style.backgroundColor = "";
    }

    // Set background color for the clicked div
    newSelectedDiv.style.backgroundColor = "lightblue";

    // Update the selected div
    selectedDiv = newSelectedDiv;

    // First letter of the string within the div
    currentIndex = parseInt(
      newSelectedDiv.innerText.trim().charAt(0).toLowerCase(),
      10
    );
  }

  // Function to log the attribute of the selected div
  function okPressedOnSelectContainer() {
    if (selectedDiv) {
      const coordinates = selectedDiv.getAttribute("data-coordinates");
      if (coordinates === null) { // 'coordinates' will be null when "default" route is selected
        clearMap();
        currentIndex = 0;

        closeDialog(document.getElementById("dropdown-dialog")); // Closes the dropdown dialog
        // Hides the delete button
        document.getElementById("delete-button").style.display = "none";
        // Moves view to current location
        map.setView(customMarker.getLatLng(), 10);
        return;
      }
      console.log("Selected div attribute:", coordinates);
      var newMapLocation = coordinates.split(",");
      if (newMapLocation.length > 1) {
        var coordinatesArray = coordinates.split(",").map((str) => str.trim());
        var coordinatesPairs = [];
        for (let i = 0; i < coordinatesArray.length; i += 2) {
          const lat = parseFloat(coordinatesArray[i]);
          const lng = parseFloat(coordinatesArray[i + 1]);
          coordinatesPairs.push([lat, lng]);
        }
        moveMapView(coordinatesPairs, currentIndex);
        closeDialog(document.getElementById("dropdown-dialog")); // Closes the dropdown dialog

        // Shows the delete button
        document.getElementById("delete-button").style.display = "flex";

        // TODO ei toimi jotenkaa
        // Set route datas to the auto mode dialog page
        let originalRouteNameString = window.Android.getData(currentIndex, "title");
        // Split the coordinates from the name resulting with only the name
        document.getElementById("dynamicText-route-name").textContent = originalRouteNameString.split(' - ')[0];
        document.getElementById("dynamicText-type").textContent = window.Android.getData(currentIndex, true);
        //document.getElementById("dynamicText-type").textContent = ;
    
        document.getElementById("dynamicText-total-length").textContent = getTotalLengthOfRoute(coordinates) + " m";
        document.getElementById("dynamicText-checkpoints").textContent = getMarkersOnMapCount(true);
        //document.getElementById("dynamicText-completed").textContent = ; // Not implemented yet
      } else clearMap();
    } else {
      console.log("No div selected.");
    }
  }

  var logButton = document.getElementById("select-ok-button");

  // Add event listener to the button
  logButton.addEventListener("click", okPressedOnSelectContainer);
}



function readSQLiteDb(ID) {
    // read data from db
    // Second param false means it reads first three columns from database (from the desired ID)
    var data = window.Android.getData(ID, false);
    // array to store the coordinates of current index (route)
    var arrOfSingleRoute = [];

    // If data is null stop the loop
    if (data.length == 0 || data === undefined || data === null) {
        // Creates dropdown options
        createDropdownOptions();
        return;
    }
    /*// Stops the loop if ID > 20
    if (ID > 20) {
        // Creates dropdown options
        createDropdownOptions();
        return;
    }*/

    // trim the "data" string to desired form
    trimmedCoordinates = dataStringTrimmer(data);

    // Appends arrays with the trimmed coordinates
    for (let i = 0; i < trimmedCoordinates.length; i++) {
        if (i == 0) {

            arrDropdownOptionNames.push(trimmedCoordinates[i])
        }
        else if (i > 0){
            arrOfSingleRoute.push(trimmedCoordinates[i]);
        }
    }
    arrCoordinates.push(arrOfSingleRoute); // testi atm
    // increase ID value
    ID++;

    // Runs the loop recursively
    readSQLiteDb(ID);
  }

function dataStringTrimmer(inputString ) {
    // Split the input string on " - "
    const splitString = inputString.split(" - ");

    // Extract the coordinates using regex
    const regex = /LatLng\((\d+\.\d+), (\d+\.\d+)\)/g;
    const coordinates = [];
    let match;
    while ((match = regex.exec(splitString[1])) !== null) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      coordinates.push([lat, lng]);
    }

    // Combine the coordinates with the first element of the split string
    const result = [splitString[0], ...coordinates];
    // Return the resulting array
    return result;
  }

  // call readSQLiteDb starting from row 1 (that for parameter is 1)

    readSQLiteDb(1);



    
