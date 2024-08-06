const settingsButton = document.getElementById("settings-icon-button");
const MenuButton = document.getElementById("menu-button");
const SettingsDialog = document.getElementById("settings-dialog");
const BluetoothDialog = document.getElementById("bluetooth-dialog");
const AreYouSureDialog = document.getElementById("are-you-sure-dialog");
const routesSelectbutton = document.getElementById('routes-select-container');
const routesSelectDialog = document.getElementById('dropdown-dialog');
const backwardRadioButton = document.getElementById("backward");
const forwardRadioButton = document.getElementById("forward");
const MenuHeaderContent = document.getElementById("menu-header-content");
const lockAndAnchorText = document.getElementById("lock-and-anchor-text");
const MenuDialogContentManualMode = document.getElementById(
  "menu-dialog-content-manual-mode"
);
const MenuDialogContentAutoMode = document.getElementById(
  "menu-dialog-content-auto-mode"
);
const ManualSteeringSlider = document.getElementById("manual-steering-slider");
const ManualSteeringSliderValue = document.getElementById(
  "manual-steering-slider-value"
);
const ManualMotorSpeedSlider = document.getElementById("manual-motor-speed-slider");
const ManualMotorSpeedSliderValue = document.getElementById("manual-motor-speed-slider-value");
const BluetoothButton = document.getElementById("bluetooth-icon");
const ConnectBluetoothButton = document.getElementById(
  "connect-bluetooth-button"
);
const BluetoothConnectionText = document.getElementById(
  "connection-state-text"
);
let BluetoothConnectionState = 10; // default value meaning "Not connected"
const LockDirectionButton = document.getElementById("lock-direction-button");
const anchorButton = document.getElementById("anchor-button");
const startRouteButton = document.getElementById("start-route-button");
const startRouteText = document.getElementById("start-route-text");
let SendGPSandOriDataActive = false;
let isLockModeOn = false;
let isAnchorModeOn = false;
let isRouteStarted = false; // Variable to store the interval id meaning if the route is started or not
let interValForAutoModeBLE; // Interval for sending current location and orientation

// Function to close the dialog
function closeDialog(element) {
  element.style.display = "none";
}

function openDialog(element) {
  element.style.display = "block";
}

function settingsButtonFunction() {
  SettingsDialog.style.display = "block";

}

routesSelectbutton.addEventListener("click", function () {
  // Open settings menu here
  routesSelectDialog.style.display = "block";
});

// tags to indentify correct BLE characteristics
const BLECharacteristicUUIDs = {
  CURRENT_LOCATION_CHARACTERISTIC_UUID:  "e0a432d7-8e2c-4380-b4b2-1568aa0412a3",
  ROUTE_COORDINATE_CHARACTERISTIC_UUID:  "20e88205-d8cd-42a9-bcfa-4b599484d362",
  STEERING_DATA_CHARACTERISTIC_UUID:     "2f926b0c-c378-474e-8ced-3194b815aedd",
  OUTBOARDMOTOR_CHARACTERISTIC_UUID:     "f53de08c-1c0c-459a-a6d5-cd26a1523060",
  ANDROID_SETTINGS_CHARACTERISTIC_UUID:  "33c5c3d4-276d-42fc-88cd-c97422441bc1",
  ERROR_MESSAGES_CHARACTERISTIC_UUID:    "1e41b064-7652-41ad-b723-71540355bf4c",
};


const BLEConnectedElementIDs = {
  ManualSteeringSlider_: 0,
  ManualMotorSpeedSlider_: 1,
  startRouteButton_: 2,
  allRouteCoordinates_: 3,
  AndroidSettings_: 4,
  BLEerrorMessages_: 5,
};


function outboardMotorSendableData() {
  let valueToSend;
  if (forwardRadioButton.checked) {
    valueToSend = ManualMotorSpeedSlider.value;
  }
  else {
    valueToSend = "-" + ManualMotorSpeedSlider.value;
  }
  return valueToSend;
}

// Steering sliders
ManualSteeringSlider.addEventListener("input", function () {
  // if route is started then perform click on the button to stop it
  if (isRouteStarted) {
    startRouteButton.click();
  }
  // if direction is locked then perform click on the button to stop it
  if (isLockModeOn) {
    LockDirectionButton.click();
  }

  if (isAnchorModeOn) {
    anchorButton.click();
  }

  ManualSteeringSliderValue.textContent = ManualSteeringSlider.value;
  Android.JSToBLEInterfaceSliders(
    BLECharacteristicUUIDs.STEERING_DATA_CHARACTERISTIC_UUID,
    ManualSteeringSlider.value)
});

ManualSteeringSlider.addEventListener("touchend", function () {
  // Timeout is to ensure that bluetooth has enough time to receive the value of the slider at touchend
  setTimeout(function () {
    Android.JSToBLEInterfaceSliders(
      BLECharacteristicUUIDs.STEERING_DATA_CHARACTERISTIC_UUID,
      ManualSteeringSlider.value);
  }, 75);
});
ManualSteeringSliderValue.textContent = ManualSteeringSlider.value; // Initialize with the default value

// Motor speed sliders
ManualMotorSpeedSlider.addEventListener("input", function () {

  // Changing speed doesn't stop auto or lock mode, but only anchor mode
  /*
  // if route is started then perform click on the button to stop it
  if (isRouteStarted) {
    startRouteButton.click();
  }
  // if direction is locked then perform click on the button to stop it
  if (isLockModeOn) {
    LockDirectionButton.click();
  }*/

  // if Anchor mode is on then perform click on the button to stop it
  if (isAnchorModeOn) {
    anchorButton.click();
  } 

  ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value;

  Android.JSToBLEInterfaceSliders(BLECharacteristicUUIDs.OUTBOARDMOTOR_CHARACTERISTIC_UUID, String(outboardMotorSendableData()));
});

ManualMotorSpeedSlider.addEventListener("touchend", function () {
  // Timeout is to ensure that bluetooth has enough time to receive the value of the slider at touchend
  setTimeout(function () {
    Android.JSToBLEInterfaceSliders(
      BLECharacteristicUUIDs.OUTBOARDMOTOR_CHARACTERISTIC_UUID,
      String(outboardMotorSendableData()));
  }, 75);
});
ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value; // Initialize with the default value

LockDirectionButton.addEventListener("click", function () {
    removeLine(); // Removes the lockModePolyline if it exists, this is done on every click of the Lock direction button
  
      if (parseInt(BluetoothConnectionState) !== 2 && !isLockModeOn) {
        // Create error message
        showToast("Bluetooth not connected", "white");
        return;
      }

    // if route is started then perform click on the button to stop it
    if (isRouteStarted) {
      startRouteButton.click();
    }

    if (isAnchorModeOn) {
      anchorButton.click();
    }
  

  if (!isLockModeOn) {
    Android.JSToBLEInterface(BLECharacteristicUUIDs.STEERING_DATA_CHARACTERISTIC_UUID, "Lock");
    lockAndAnchorText.style.display = "block";
    lockAndAnchorText.textContent = "Current direction is now locked";
    LockDirectionButton.textContent = "Unlock direction";
  } else {
    lockAndAnchorText.style.display = "none";
    Android.JSToBLEInterface(
      BLECharacteristicUUIDs.STEERING_DATA_CHARACTERISTIC_UUID, "stop");
    LockDirectionButton.textContent = "Lock direction";
  }
  isLockModeOn = !isLockModeOn;
  sendGPSandOriData(); // This function sends the GPS and orientation data via BLE or is actually an interface to the actual sender
});

anchorButton.addEventListener("click", function () {
  removeAnchorMarker(); // Removes the anchorMarker if it exists, this is done on every click of the Lock direction button

  if (parseInt(BluetoothConnectionState) !== 2 && !isAnchorModeOn) {
    // Create error message
    showToast("Bluetooth not connected", "white");
    return;
  }
  // if route is started then perform click on the button to stop it
  if (isRouteStarted) {
    startRouteButton.click();
  }
  if (isLockModeOn) {
    LockDirectionButton.click();
  }

  if (!isAnchorModeOn) {
    Android.JSToBLEInterface(BLECharacteristicUUIDs.STEERING_DATA_CHARACTERISTIC_UUID, "Anchor");
    lockAndAnchorText.style.display = "block";
    lockAndAnchorText.textContent = "Current location is now anchored";
    anchorButton.textContent = "Remove anchor";
  } else {
    lockAndAnchorText.style.display = "none";
    Android.JSToBLEInterface(
      BLECharacteristicUUIDs.STEERING_DATA_CHARACTERISTIC_UUID, "stop");
      anchorButton.textContent = "Set anchor";
  }

  isAnchorModeOn = !isAnchorModeOn;
  sendGPSandOriData(); // This function sends the GPS and orientation data via BLE or is actually an interface to the actual sender
  if (isAnchorModeOn) {
    drawAnchorMarker();
  }
});


BluetoothButton.addEventListener("click", function () {
  BluetoothDialog.style.display = "block";
});

ConnectBluetoothButton.addEventListener("click", function () {
  console.log("BluetoothConnectionState", BluetoothConnectionState);
  if (BluetoothConnectionState == 0 || BluetoothConnectionState == 10 ||BluetoothConnectionState == 11) {
    Android.connectBluetooth();
  } else if (BluetoothConnectionState == 1 || BluetoothConnectionState == 2) {
    Android.disconnectBluetooth();
  }
});

function showToast(message, textColor, timePeriod = 2500) {
  timePeriod = parseInt(timePeriod)

  var toast = document.getElementById('toast');
  var toastText = document.getElementById('toast-text');
  toastText.textContent = message;
  toast.style.display = 'flex';

  // Get the width of the page
  var pageWidth = document.documentElement.clientWidth;

  // Get the width of the toast element
  var toastWidth = toast.offsetWidth;

  // Calculate the left position for centering the toast
  var leftPosition = (pageWidth - toastWidth) / 2;

  // Apply the left position to the toast element
  toast.style.left = leftPosition + "px";

  // Clear previous timeout if exists
  if (showToast.timeoutId) {
    clearTimeout(showToast.timeoutId);
  }

  // Remove message after 2.5 seconds
  showToast.timeoutId = setTimeout(hideToast, timePeriod);
}

function hideToast() {
  var toast = document.getElementById('toast');
  toast.style.display = 'none';
}


function toggleStartRouteButton() {
  var isAndroidGPSinUse = jsObject["is_android_GPS_used"] === "true";
  var isAndroidOrientationInUse = jsObject["is_android_orientation_used"] === "true";
  // If bluetooth not connected create error message and return
  if (parseInt(BluetoothConnectionState) !== 2) {
    // Create error message element
    showToast("Bluetooth not connected", "white");

    return;
  }
  // If no route selected create error message and return
  if (parseInt(currentIndex) === 0) {
    // Create error message element
    showToast("Please select a route first", "white");

    return;
  } else {
    startRouteText.children[0].textContent = "Route started";
    startRouteText.children[0].style.color = "green";
    startRouteText.style.display = "none";
  }

  isRouteStarted = !isRouteStarted; // Update isRouteStarted state

  // if direction is locked then perform click on the button to stop it
  if (isLockModeOn) {
    LockDirectionButton.click();
  }

  // if isAnchorModeOn then perform click on the button to stop it
  if (isAnchorModeOn) {
    anchorButton.click();
  }

  console.log("RouteStarted: ", isRouteStarted);

  if (isRouteStarted) {
    startRouteButton.textContent = "Stop";
    startRouteText.style.display = "block";
    Android.JSToBLEInterface(BLECharacteristicUUIDs.STEERING_DATA_CHARACTERISTIC_UUID, "start");

    // Here it sends all route coordinates via BLE
    // The second parameter is the current index of a route that is selected, it is then retrieved from the database with the given index
    Android.JSToBLEInterfaceSelectedRoute(BLECharacteristicUUIDs.ROUTE_COORDINATE_CHARACTERISTIC_UUID, parseInt(currentIndex));

  } else {
    startRouteButton.textContent = "Start";
    startRouteText.style.display = "none";

    // Send "stop"
    Android.JSToBLEInterface(BLECharacteristicUUIDs.STEERING_DATA_CHARACTERISTIC_UUID, "stop");
  }
  sendGPSandOriData(); // This function sends the GPS and orientation data via BLE or is actually an interface to the actual sender
}
// Attach the toggleStartRouteButton function to the button click event
startRouteButton.addEventListener("click", toggleStartRouteButton);

function sendGPSandOriData() {
  var isAndroidGPSinUse = jsObject["is_android_GPS_used"] === "true";
  var isAndroidOrientationInUse = jsObject["is_android_orientation_used"] === "true";

  SendGPSandOriDataActive = !SendGPSandOriDataActive;

  if (SendGPSandOriDataActive) {
    if (isAndroidGPSinUse || isAndroidOrientationInUse) {
      // Here it sends the current location every 1.5 seconds coordinates via BLE
      interValForAutoModeBLE = setInterval(function () {
        Android.JSToBLEInterfaceGPSandOri(BLECharacteristicUUIDs.CURRENT_LOCATION_CHARACTERISTIC_UUID, isAndroidGPSinUse, isAndroidOrientationInUse);
      }, 200);
      console.log("Interval started: ", interValForAutoModeBLE);
    }
} else {
    // Clear the interval if it's set
    if (interValForAutoModeBLE) {
      clearInterval(interValForAutoModeBLE);
      console.log("Interval cleared: ", interValForAutoModeBLE);
      interValForAutoModeBLE = null;
    }
  }
}

const BluetoothConnectionStates = {
  0: "Disconnected",
  1: "Connecting...",
  2: "Connected",
  3: "Disconnecting...",
  10: "Not connected",
  11: "Device was not found",
  12: "Scanning for bluetooth devices...",
};

function setBluetoothConnectionStateText(BLEState) {
  console.log("Called with", BLEState);
  // Convert BLEState to a number explicitly
  BluetoothConnectionState = parseInt(BLEState, 10);

  // Set correct text from BluetoothConnectionStates
  if (BluetoothConnectionStates.hasOwnProperty(BluetoothConnectionState)) {
    console.log(BluetoothConnectionStates[BluetoothConnectionState]);
    const text = BluetoothConnectionStates[BluetoothConnectionState];
    BluetoothConnectionText.textContent = text;

    // Use a switch statement to set the text color based on the connection state
    switch (BluetoothConnectionState) {
      case 0:
        BluetoothConnectionText.style.color = "red"; // Connected (green color)
        BluetoothConnectionText.textContent = "Disconnected"
        ConnectBluetoothButton.textContent = "Connect"

        break;
      case 1:
      case 2:
        BluetoothConnectionText.style.color = "green"; // Connected (green color)
        ConnectBluetoothButton.disabled = false;
        ConnectBluetoothButton.textContent = "Disconnect"
        
       // BluetoothButton.src = 'icons/bluetooth-icon-green.svg';
       // Send settings to ESP32 after small delay, to give time for BLE to setup correctly
       setTimeout(() => {
        sendSettingsViaBLE();
        console.log("sendSettingsViaBLE called after 1 second delay.");
      }, "1000");
      

       // Android.BLEReadRequest(); // Tää ei toimi (BLEHandlerin puolella Androidin Java-koodissa siis)
        break;
      case 3:
      case 10:
      case 11:
        BluetoothConnectionText.style.color = "red"; // Disconnected, Disconnecting, or Device not found (red color)
        ConnectBluetoothButton.disabled = false;
       // BluetoothButton.src = 'icons/bluetooth-icon-red.svg';
        break;
      case 12:
        BluetoothConnectionText.style.color = "blue"; // Scanning
        ConnectBluetoothButton.disabled = true;
      //  BluetoothButton.src = 'icons/bluetooth-icon-blue.svg';
        break;
      default:
        BluetoothConnectionText.style.color = defaultColor;
        ConnectBluetoothButton.disabled = false;
        BluetoothButton.src = 'icons/bluetooth-icon-black.svg';
        break;
    }
  } else {
    BluetoothConnectionText.textContent = "Unknown";
    BluetoothConnectionText.style.color = defaultColor;
  }
}

function rangeSliderArithmetic(element) {
  
  // Changing speed doesn't stop auto or lock mode, but only anchor mode
  /*
  // if route is started then perform click on the button to stop it
  if (isRouteStarted) {
    startRouteButton.click();
  }
  // if direction is locked then perform click on the button to stop it
  if (isLockModeOn) {
    LockDirectionButton.click();
  }*/
  
  if (isAnchorModeOn) {
    anchorButton.click();
  }

  switch (element.id) {
    case "minus-svg-icon-speed":
      ManualMotorSpeedSlider.value = parseInt(ManualMotorSpeedSlider.value) - 5;
      ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value;
      Android.JSToBLEInterfaceSliders(
        BLECharacteristicUUIDs.OUTBOARDMOTOR_CHARACTERISTIC_UUID,
        String(outboardMotorSendableData()));
      break;
    case "plus-svg-icon-speed":
      ManualMotorSpeedSlider.value = parseInt(ManualMotorSpeedSlider.value) + 5;
      ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value;
      Android.JSToBLEInterfaceSliders(
        BLECharacteristicUUIDs.OUTBOARDMOTOR_CHARACTERISTIC_UUID,
        String(outboardMotorSendableData()));

      break;
    case "minus-svg-icon-steer":
      ManualSteeringSlider.value =
        parseInt(ManualSteeringSliderValue.value) - 5;
      ManualSteeringSliderValue.textContent = ManualSteeringSlider.value;
      Android.JSToBLEInterfaceSliders(
        BLECharacteristicUUIDs.STEERING_DATA_CHARACTERISTIC_UUID,
        ManualSteeringSlider.value);

      break;
    case "plus-svg-icon-steer":
      ManualSteeringSlider.value =
        parseInt(ManualSteeringSliderValue.value) + 5;
      ManualSteeringSliderValue.textContent = ManualSteeringSlider.value;
      Android.JSToBLEInterfaceSliders(
        BLECharacteristicUUIDs.STEERING_DATA_CHARACTERISTIC_UUID,
        ManualSteeringSlider.value);
      break;
    default:
      console.log("Unexpected situation");
  }
}

function fwdBwdRadioButtonChanged() {
  ManualMotorSpeedSlider.value = 0;
  ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value;
  setTimeout(function () {
    Android.JSToBLEInterfaceSliders(
      BLECharacteristicUUIDs.OUTBOARDMOTOR_CHARACTERISTIC_UUID,
      ManualMotorSpeedSlider.value);
  }, 75);
}

function showPopup(id) {
  var popup = document.getElementById(id);
  popup.style.display = (popup.style.display === "block") ? "none" : "block";
}

// Initialize default value
setBluetoothConnectionStateText(BluetoothConnectionState);
