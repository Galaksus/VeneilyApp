// Get references to the HTML elements
const settingsButton = document.getElementById("settings-icon-button");
const MenuButton = document.getElementById("menu-button");
const SettingsDialog = document.getElementById("settings-dialog");
const BluetoothDialog = document.getElementById("bluetooth-dialog");
const AreYouSureDialog = document.getElementById("are-you-sure-dialog");
const routesSelectbutton = document.getElementById('routes-select-container');
const routesSelectDialog = document.getElementById('dropdown-dialog');
const MenuHeaderContent = document.getElementById("menu-header-content");
const MenuDialogRightArrow = document.getElementById("menu-dialog-right-arrow");
const MenuDialogLeftArrow = document.getElementById("menu-dialog-left-arrow");
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
const ManualMotorSpeedSlider = document.getElementById(
  "manual-motor-speed-slider"
);
const ManualMotorSpeedSliderValue = document.getElementById(
  "manual-motor-speed-slider-value"
);
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
const buttonsClass = document.querySelectorAll(".button-class");

let isLockModeOn = false;
let isRouteStarted; // Variable to store the interval id meaning if the route is started or not

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

// Menu dialog page switching to manual mode
MenuDialogRightArrow.addEventListener("click", function () {
  // Set other arrow hidden and other visible
  MenuDialogRightArrow.style.display = "none";
  MenuDialogLeftArrow.style.display = "block";
  // Set manual mode elements visible and auto mode hidden
  MenuDialogContentManualMode.style.display = "none";
  MenuDialogContentAutoMode.style.display = "block";
  // Set text to the menu header
  MenuHeaderContent.textContent = "Auto mode";
});

// Menu dialog page switching to auto mode
MenuDialogLeftArrow.addEventListener("click", function () {
  // Set other arrow hidden and other visible
  MenuDialogRightArrow.style.display = "block";
  MenuDialogLeftArrow.style.display = "none";
  // Set auto mode elements visible and manual mode hidden
  MenuDialogContentAutoMode.style.display = "none";
  MenuDialogContentManualMode.style.display = "block";
  // Set text to the menu header
  MenuHeaderContent.textContent = "Manual mode";
});

const BLEConnectedElementIDs = {
  ManualSteeringSlider_: 0,
  ManualMotorSpeedSlider_: 1,
  startRouteButton_: 2,
  allRouteCoordinates_: 3,
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
  Android.JSToBLEInterface(
    BLEConnectedElementIDs.ManualSteeringSlider_,
    parseInt(ManualSteeringSlider.value),
    null
  );
});

ManualSteeringSlider.addEventListener("touchend", function () {
  // Timeout is to ensure that bluetooth has enough time to receive the value of the slider at touchend
  setTimeout(function () {
    Android.JSToBLEInterface(
      BLEConnectedElementIDs.ManualSteeringSlider_,
      parseInt(ManualSteeringSlider.value),
      null
    );
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
  Android.JSToBLEInterface(
    BLEConnectedElementIDs.ManualMotorSpeedSlider_,
    parseInt(ManualMotorSpeedSlider.value),
    null
  );
});

ManualMotorSpeedSlider.addEventListener("touchend", function () {
  // Timeout is to ensure that bluetooth has enough time to receive the value of the slider at touchend
  setTimeout(function () {
    Android.JSToBLEInterface(
      BLEConnectedElementIDs.ManualMotorSpeedSlider_,
      parseInt(ManualMotorSpeedSlider.value),
      null
    );
  }, 75);
});
ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value; // Initialize with the default value

LockDirectionButton.addEventListener("click", function () {
  // if route is started then perform click on the button to stop it
  if (isRouteStarted) {
    startRouteButton.click();
  }

  if (!isLockModeOn) {
    Android.JSToBLEInterface(
      BLEConnectedElementIDs.ManualSteeringSlider_,
      null,
      "Lock"
    );
    document.getElementById("lock-direction-text").style.display = "block";
    LockDirectionButton.textContent = "Unlock direction";
  } else {
    document.getElementById("lock-direction-text").style.display = "none";
    Android.JSToBLEInterface(
      BLEConnectedElementIDs.ManualSteeringSlider_,
      null,
      "stop"
    );
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

function toggleStartRouteButton() {
  // If bluetooth not connected return
  if (parseInt(BluetoothConnectionState) !== 2) {
    return;
  }
  // If no route selected return
  if (parseInt(currentIndex) === 0) {
    startRouteText.children[0].textContent = "Please select a route first";
    startRouteText.children[0].style.color = "red";
    startRouteText.style.display = "block";

    // Hide the element after 2500 ms
    setTimeout(function () {
      startRouteText.style.display = "none";
    }, 2500);
    return;
  } else {
    startRouteText.children[0].textContent = "Route started";
    startRouteText.children[0].style.color = "green";
    startRouteText.style.display = "none";
  }

  // if direction is locked then perform click on the button to stop it
  if (isLockModeOn) {
    LockDirectionButton.click();
  }

  // if a route selected start calling Java to send current location periodically
  if (isRouteStarted) {
    clearInterval(isRouteStarted);
    isRouteStarted = null;
    startRouteButton.textContent = "Start";
    startRouteText.style.display = "none";
  } else {
    Android.JSToBLEInterface(BLEConnectedElementIDs.allRouteCoordinates_, parseInt(currentIndex));
    // These will be run periodically given the interval time
    isRouteStarted = setInterval(function () {
      Android.JSToBLEInterface(BLEConnectedElementIDs.startRouteButton_);
    }, 1500);
    startRouteButton.textContent = "Stop";
    startRouteText.style.display = "block";
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

        Android.BLEReadRequest(); // Tää ei toimi (BLEHandlerin puolella Androidin Java-koodissa siis)
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
      Android.JSToBLEInterface(
        BLEConnectedElementIDs.ManualMotorSpeedSlider_,
        parseInt(ManualMotorSpeedSlider.value),
        null
      );
      break;
    case "plus-svg-icon-speed":
      ManualMotorSpeedSlider.value = parseInt(ManualMotorSpeedSlider.value) + 5;
      ManualMotorSpeedSliderValue.textContent = ManualMotorSpeedSlider.value;
      Android.JSToBLEInterface(
        BLEConnectedElementIDs.ManualMotorSpeedSlider_,
        parseInt(ManualMotorSpeedSlider.value),
        null
      );

      break;
    case "minus-svg-icon-steering":
      ManualSteeringSlider.value =
        parseInt(ManualSteeringSliderValue.value) - 5;
      ManualSteeringSliderValue.textContent = ManualSteeringSlider.value;
      Android.JSToBLEInterface(
        BLEConnectedElementIDs.ManualSteeringSlider_,
        parseInt(ManualSteeringSlider.value),
        null
      );

      break;
    case "plus-svg-icon-steering":
      ManualSteeringSlider.value =
        parseInt(ManualSteeringSliderValue.value) + 5;
      ManualSteeringSliderValue.textContent = ManualSteeringSlider.value;
      Android.JSToBLEInterface(
        BLEConnectedElementIDs.ManualSteeringSlider_,
        parseInt(ManualSteeringSlider.value),
        null
      );
      break;
    default:
      console.log("Unexpected situation");
  }
}

// This function makes buttons change color onClick and returns to normal color after 200ms
// Add a click event listener to each button
buttonsClass.forEach(function (button) {
  button.addEventListener("click", function () {
    if (
      button.id === "connect-bluetooth-button"
    ) {
      return;
    }
    // Change the background color on click
    this.style.backgroundColor = "#2980b9"; // New color

    // Set a timeout to revert the background color after 200 ms delay
    setTimeout(function () {
      button.style.backgroundColor = "#3498db"; // Revert to default color
    }, 200);
  });
});

// Initialize default value
setBluetoothConnectionStateText(BluetoothConnectionState);
