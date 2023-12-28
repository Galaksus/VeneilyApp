var arrCoordinates = [];
var arrDropdownOptionNames = [];


function createDropdownOptions() {

    // Clear all existing select element options expect for the first one
    var select = document.getElementById("routes");
    var optionToKeep = select.options[0];
    select.innerHTML = '';
    select.appendChild(optionToKeep);

    // Get element by id and create as many dropdown options as there are elements in the array
    for (let i = 0; i < arrDropdownOptionNames.length; i++) {
        const option = document.createElement("option");
        option.text = arrDropdownOptionNames[i];
        option.value = arrCoordinates[i].join(",");
        select.appendChild(option);
    }
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