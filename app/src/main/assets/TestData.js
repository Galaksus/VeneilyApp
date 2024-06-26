// This file is to handle of the button associated with storing test data to database



const testDataSaveButton = document.getElementById("test-data-saving-button");
// Access the img element inside the test data saving button div
const imgElement = testDataSaveButton.querySelector(".svg-image");

const clearTestDataDb = document.getElementById("clear-test-data-db");

let testDataSaveButtonToggleState = false;


function updateTestDataSaveButtonStyles() {
    if (testDataSaveButtonToggleState){
        imgElement.src = "icons/test-data-saving-toggled.svg";
    }
    else {
        imgElement.src = "icons/test-data-saving.svg";
    }
}

testDataSaveButton.addEventListener('click', function() {
    /*
    * 
    */
      // if route is started then perform click on the button to stop it
    if (!isRouteStarted && !isLockModeOn && !isAnchorModeOn) {
        showToast("None of the automatic modes are active", "white");
        return;
    }

    testDataSaveButtonToggleState = !testDataSaveButtonToggleState;
    updateTestDataSaveButtonStyles();

    console.log("testDataSaveButtonToggleState", testDataSaveButtonToggleState)

    let associatedData;
    if (isRouteStarted) {
        associatedData = GlobalVarCoordinates;
    }
    else if (isLockModeOn) {
        associatedData = globalLockModeCoordinates;
    }
    
    Android.handleDataStoring(testDataSaveButtonToggleState, associatedData);
  });
  
  function setTestDataSaveButtonStateFromJava(state) {
    console.log("type of 'state'", typeof(state), "value", state);
    
    if (typeof state === 'string') {
        state = state.toLowerCase() === 'true';
    } else {
        state = Boolean(state);
    }
    
    console.log("type of 'state'", typeof(state), "value", state);
    testDataSaveButtonToggleState = state;
    updateTestDataSaveButtonStyles();
}

clearTestDataDb.addEventListener('click', function() { 
    Android.clearResultsTable();
    showToast("All data from TestDataTable should now be cleared from database", "white");
});