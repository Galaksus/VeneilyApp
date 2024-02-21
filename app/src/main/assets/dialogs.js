const settingsButton = document.getElementById("settings-icon-button");
const MenuButton = document.getElementById("menu-button");
const SettingsDialog = document.getElementById("settings-dialog");
const BluetoothDialog = document.getElementById("bluetooth-dialog");
const AreYouSureDialog = document.getElementById("are-you-sure-dialog");
const routesSelectbutton = document.getElementById('routes-select-container');
const routesSelectDialog = document.getElementById('dropdown-dialog');
const MenuHeaderContent = document.getElementById("menu-header-content");
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
const startRouteButton = document.getElementById("start-route-button");
const startRouteText = document.getElementById("start-route-text");

let isLockModeOn = false;
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

// tags to indentify correct BLE characteristics // Muokkaa UUID:ksi?
const BLECharacteristicUUIDs = {
  CURRENT_LOCATION_CHARACTERISTIC_UUID:  "e0a432d7-8e2c-4380-b4b2-1568aa0412a3",
  ROUTE_COORDINATE_CHARACTERISTIC_UUID:  "20e88205-d8cd-42a9-bcfa-4b599484d362",
  MANUAL_MODE_DATA_CHARACTERISTIC_UUID:  "2f926b0c-c378-474e-8ced-3194b815aedd",
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
  ManualSteeringSliderValue.textContent = ManualSteeringSlider.value;
  Android.JSToBLEInterfaceSliders(
    BLECharacteristicUUIDs.MANUAL_MODE_DATA_CHARACTERISTIC_UUID,
    ManualSteeringSlider.value)
});

ManualSteeringSlider.addEventListener("touchend", function () {
  // Timeout is to ensure that bluetooth has enough time to receive the value of the slider at touchend
  setTimeout(function () {
    Android.JSToBLEInterfaceSliders(
      BLECharacteristicUUIDs.MANUAL_MODE_DATA_CHARACTERISTIC_UUID,
      ManualSteeringSlider.value);
  }, 75);
});
ManualSteeringSliderValue.textContent = ManualSteeringSlider.value; // Initialize with the default value

// Motor speed sliders
ManualMotorSpeedSlider.addEventListener("input", function () {
  // if route is started then perform click on the button to stop it
  if (isRouteStarted) {
    startRouteButton.click();
  }
  // if direction is locked then perform click on the button to stop it
  if (isLockModeOn) {
    LockDirectionButton.click();
  }

  ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value;
  Android.JSToBLEInterfaceSliders(BLECharacteristicUUIDs.OUTBOARDMOTOR_CHARACTERISTIC_UUID, String(ManualMotorSpeedSlider.value));
});

ManualMotorSpeedSlider.addEventListener("touchend", function () {
  // Timeout is to ensure that bluetooth has enough time to receive the value of the slider at touchend
  setTimeout(function () {
    Android.JSToBLEInterfaceSliders(
      BLECharacteristicUUIDs.OUTBOARDMOTOR_CHARACTERISTIC_UUID,
      ManualMotorSpeedSlider.value);
  }, 75);
});
ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value; // Initialize with the default value

LockDirectionButton.addEventListener("click", function () {
      if (parseInt(BluetoothConnectionState) !== 2 && !isLockModeOn) {
        // Create error message element
        createMessage("Bluetooth not connected", "lockdirection-button-error-message", "red", "black");
        return;
      }

    // if route is started then perform click on the button to stop it
    if (isRouteStarted) {
      startRouteButton.click();
    }


  if (!isLockModeOn) {
    Android.JSToBLEInterface(BLECharacteristicUUIDs.MANUAL_MODE_DATA_CHARACTERISTIC_UUID, "Lock");
    document.getElementById("lock-direction-text").style.display = "block";
    LockDirectionButton.textContent = "Unlock direction";
  } else {
    document.getElementById("lock-direction-text").style.display = "none";
    Android.JSToBLEInterface(
      BLECharacteristicUUIDs.MANUAL_MODE_DATA_CHARACTERISTIC_UUID, "stop");
    LockDirectionButton.textContent = "Lock direction";
  }
  isLockModeOn = !isLockModeOn;
});

BluetoothButton.addEventListener("click", function () {
  BluetoothDialog.style.display = "block";
});

ConnectBluetoothButton.addEventListener("click", function () {
  Android.connectBluetooth();
});

function createMessage(messageString, messageId, messageTextColor, messageBackgroundColor) {
  var message = document.getElementById(messageId);

  if (message) {
    message.parentNode.removeChild(message);
  }
  var message = document.createElement("p");
  message.id = messageId;
  message.innerText = messageString;
  message.style.color = messageTextColor;
  message.style.backgroundColor = messageBackgroundColor;
  message.className = "error-message"; // Assigning the class for styling
  // Append the message element to the body
  document.body.appendChild(message);

  // Remove message after 2.5 seconds
  setTimeout(removeMessage, 2500);

  // Remove message when clicking anywhere on the message
  message.addEventListener('click', removeMessage);
  
  function removeMessage() {
    if (message && message.parentNode) {
      message.parentNode.removeChild(message);
    }
  }
}

function toggleStartRouteButton() {
  var isAndroidGPSinUse = jsObject["is_android_GPS_used"] === "true";
  var isAndroidOrientationInUse = jsObject["is_android_orientation_used"] === "true";
  // If bluetooth not connected create error message and return
  if (parseInt(BluetoothConnectionState) !== 2) {
    // Create error message element
    createMessage("Bluetooth not connected", "start-button-error-message", "red", "black");
    return;
  }
  // If no route selected create error message and return
  if (parseInt(currentIndex) === 0) {
    // Create error message element
    createMessage("Please select a route first", "start-button-error-message", "red", "black");
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


  // if direction is locked then perform click on the button to stop it
  if (isLockModeOn) {
    LockDirectionButton.click();
  }
  console.log("RouteStarted: ", isRouteStarted);
  
  if (isRouteStarted) {
    startRouteButton.textContent = "Stop";
    startRouteText.style.display = "block";
    Android.JSToBLEInterface(BLECharacteristicUUIDs.CURRENT_LOCATION_CHARACTERISTIC_UUID, "start");
  
    // Here it sends all route coordinates via BLE
    // The second parameter is the current index of a route that is selected, it is then retrieved from the database with the given index
    Android.JSToBLEInterfaceSelectedRoute(BLECharacteristicUUIDs.ROUTE_COORDINATE_CHARACTERISTIC_UUID, parseInt(currentIndex));
  
    // Send periodic data of Android GPS or Orientation if one or both of them are in use
    if (isAndroidGPSinUse || isAndroidOrientationInUse) {
      // Here it sends the current location every 1.5 seconds coordinates via BLE
      interValForAutoModeBLE = setInterval(function () {
        console.log("Sending location...");
        Android.JSToBLEInterfaceGPSandOri(BLECharacteristicUUIDs.CURRENT_LOCATION_CHARACTERISTIC_UUID, isAndroidGPSinUse, isAndroidOrientationInUse);
      }, 1500);
      console.log("Interval started: ", interValForAutoModeBLE);
    }
  } else {
    startRouteButton.textContent = "Start";
    startRouteText.style.display = "none";
  
    // Clear the interval if it's set
    if (interValForAutoModeBLE) {
      clearInterval(interValForAutoModeBLE);
      console.log("Interval cleared: ", interValForAutoModeBLE);
      interValForAutoModeBLE = null;
    }
  
    // Send "stop" 
    Android.JSToBLEInterface(BLECharacteristicUUIDs.CURRENT_LOCATION_CHARACTERISTIC_UUID, "stop");
  }
}

// Attach the toggleStartRouteButton function to the button click event
startRouteButton.addEventListener("click", toggleStartRouteButton);

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
  // Convert BLEState to a number explicitly
  BluetoothConnectionState = parseInt(BLEState, 10);

  // Set correct text from BluetoothConnectionStates
  if (BluetoothConnectionStates.hasOwnProperty(BluetoothConnectionState)) {
    console.log(BluetoothConnectionStates[BluetoothConnectionState]);
    const text = BluetoothConnectionStates[BluetoothConnectionState];
    BluetoothConnectionText.textContent = text;

    // Use a switch statement to set the text color based on the connection state
    switch (BluetoothConnectionState) {
      case 1:
      case 2:
        BluetoothConnectionText.style.color = "green"; // Connected (green color)
        ConnectBluetoothButton.disabled = true;
       // BluetoothButton.src = 'icons/bluetooth-icon-green.svg';
       // Send settings to ESP32
       sendSettingsViaBLE();

       // Android.BLEReadRequest(); // Tää ei toimi (BLEHandlerin puolella Androidin Java-koodissa siis)
        break;
      case 0:
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
  // if route is started then perform click on the button to stop it
  if (isRouteStarted) {
    startRouteButton.click();
  }
  // if direction is locked then perform click on the button to stop it
  if (isLockModeOn) {
    LockDirectionButton.click();
  }

  switch (element.id) {
    case "minus-svg-icon-speed":
      ManualMotorSpeedSlider.value = parseInt(ManualMotorSpeedSlider.value) - 5;
      ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value;
      Android.JSToBLEInterfaceSliders(
        BLECharacteristicUUIDs.OUTBOARDMOTOR_CHARACTERISTIC_UUID,
        ManualMotorSpeedSlider.value);
      break;
    case "plus-svg-icon-speed":
      ManualMotorSpeedSlider.value = parseInt(ManualMotorSpeedSlider.value) + 5;
      ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value;
      Android.JSToBLEInterfaceSliders(
        BLECharacteristicUUIDs.OUTBOARDMOTOR_CHARACTERISTIC_UUID,
        ManualMotorSpeedSlider.value);

      break;
    case "minus-svg-icon-steer":
      ManualSteeringSlider.value =
        parseInt(ManualSteeringSliderValue.value) - 5;
      ManualSteeringSliderValue.textContent = ManualSteeringSlider.value;
      Android.JSToBLEInterfaceSliders(
        BLECharacteristicUUIDs.MANUAL_MODE_DATA_CHARACTERISTIC_UUID,
        ManualSteeringSlider.value);

      break;
    case "plus-svg-icon-steer":
      ManualSteeringSlider.value =
        parseInt(ManualSteeringSliderValue.value) + 5;
      ManualSteeringSliderValue.textContent = ManualSteeringSlider.value;
      Android.JSToBLEInterfaceSliders(
        BLECharacteristicUUIDs.MANUAL_MODE_DATA_CHARACTERISTIC_UUID,
        ManualSteeringSlider.value);
      break;
    default:
      console.log("Unexpected situation");
  }
}



// Initialize default value
setBluetoothConnectionStateText(BluetoothConnectionState);
