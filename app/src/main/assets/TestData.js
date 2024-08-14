// This file is to handle of the button associated with storing test data to database



const testDataSaveButton = document.getElementById("test-data-saving-button");
// Access the img element inside the test data saving button div
const imgElement = testDataSaveButton.querySelector(".svg-image");
const AreYouSureDialog2 = document.getElementById("are-you-sure-dialog-2");

const clearTestDataDb = document.getElementById("clear-test-data-db");
const testDataSaveInterval = document.getElementById("test-data-save-interval");
const testDataSavePeriod = document.getElementById("test-data-save-period");
const testDataSavingButtonText = document.querySelector('#test-data-saving-button p');
const testDataSavingButtonDefaultText = 'Save test data';

let testDataSaveButtonToggleState = false;


function updateTestDataSaveButtonStyles() {
    if (testDataSaveButtonToggleState){
        imgElement.src = "icons/test-data-saving-toggled.svg";
    }
    else {
        imgElement.src = "icons/test-data-saving.svg";
    }
}


let countdownInterval;
let remainingTime;
testDataSaveButton.addEventListener('click', function() {
    /*
    * 
    */
    if (!isRouteStarted && !isLockModeOn && !isAnchorModeOn && !testDataSaveButtonToggleState) {
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
    else if (isAnchorModeOn) {
        let latLng = anchorMarker.getLatLng();
        associatedData = `${latLng.lat.toFixed(6)}, ${latLng.lng.toFixed(6)}`;
        console.log(associatedData); // Outputs something like "51.500000, -0.090000"
    }
    // Convert interval and period to floats if they are not already
    let interval = parseFloat(testDataSaveInterval.value);
    let period = parseFloat(testDataSavePeriod.value);
    Android.handleDataStoring(testDataSaveButtonToggleState, associatedData, interval, period);

    if (testDataSaveButtonToggleState) {
        showToast(`Test data is now being saved for ${period} minutes with interval of ${interval} seconds`, 'white', 5000);


        remainingTime = period * 60; // Convert minutes to seconds

        // Set up an interval to update the remaining time every second
        countdownInterval = setInterval(function() {
            if (remainingTime > 0) {
                // Calculate minutes and seconds
                let minutes = Math.floor(remainingTime / 60);
                let seconds = remainingTime % 60;

                // Format seconds to always show two digits
                seconds = seconds < 10 ? '0' + seconds : seconds;

                console.log(`Remaining time: ${remainingTime}`);

                remainingTime--; // Decrement after checking
                testDataSavingButtonText.textContent = testDataSavingButtonDefaultText + ' ' + `${minutes}:${seconds}`;
            } else {
                clearInterval(countdownInterval);
                console.log('Time is up!');
            }
        }, 1000);
    }
    else {
        showToast('Test data saving stopped.', 'white');
        testDataSavingButtonText.textContent = testDataSavingButtonDefaultText;
        //
        clearInterval(countdownInterval); // Stop the countdown when the button is toggled off
        console.log('Countdown stopped.');

    }

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
    AreYouSureDialog2.style.display = "block";
    AreYouSureDialog2.style.zIndex = "10000"; 
});

function proceedToClearTestDataTable() {
    Android.clearResultsTable();
    showToast("All data from TestDataTable should now be cleared from database", "white");
    AreYouSureDialog2.style.display = "none";
}
