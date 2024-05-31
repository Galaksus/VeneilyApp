const SaveSettingsButton = document.getElementById("save-settings-button");
const Switch_GPS = document.getElementById("Switch-GPS");
const Switch_orientation = document.getElementById("Switch-orientation");
const Switch_OpenSeaMap_tile = document.getElementById("Switch-OpenSeaMap-tile");
const inputInterpolatedThresold = document.getElementById("distance-to-interpolated-point-max");
const servoMaxChange = document.getElementById("servo-max-change");

const kP = document.getElementById("kP");
const kI = document.getElementById("kI");
const kD = document.getElementById("kD");
const dT = document.getElementById("dT");


// The settings, C++ equivalent of struct and JavaScript object (dict), where key equals table's column name and value the value for the column (string)
// These variables goes trough BLE
var jsObject = {
    is_android_GPS_used: 'false',
    is_android_orientation_used: 'false',
    distance_to_interpolated_point_max: 8.0,
    servo_max_change: 10,
    kP: 0,
    kI: 0,
    kD: 0,
    dT: 0,
    use_OpenSeaMap: 'false'  // This won't go trough BLE, or in fact it will but it will appear as unknown in the ESP32 side.
    //key3: 'value3' // add more column names and values when needed
};

function sendSettingsViaBLE() {
    /*
    * Sends settings as a json string to microcontroller via BLE
    */
    var jsonString = JSON.stringify(jsObject);

    // send data if BLE is connected
    if (BluetoothConnectionState == 2) { // 2 means "Conneted" in 'BluetoothConnectionStates' variable
        Android.JSToBLEInterface(BLECharacteristicUUIDs.ANDROID_SETTINGS_CHARACTERISTIC_UUID, jsonString);
    }
}
function updateSettingsDatabase() {
    /*
    * Updates the settings table in the database
    */
    // Convert the JavaScript object to a JSON string
    var jsonString = JSON.stringify(jsObject);
    console.log(jsonString);
    // Call the Java function with the JSON string as a parameter
    Android.updateSettingsDB(jsonString);
    getAllSettingsData();

    // Creates a message that shows that settings are saved
    showToast("Settings saved", "white");
}

function getAllSettingsData() {
    /*
    * Gets all settings table data from the database in JSON string format
    */
    // Data is received in JSON string format
    var settingsDataJSON = Android.getSettingsData();

    // Replaces square brackets with nothing, in other words removes them
    settingsDataJSON = settingsDataJSON.replace(/\[|\]/g, ''); 
    console.log("Json: ",settingsDataJSON);

    // Creates an JS object from the given JSON string
    var jsObjectLocal = JSON.parse(settingsDataJSON);


    // set the global object to be equal to the local object (data from DB)
    jsObject = jsObjectLocal;

    console.log(jsObject);

    updateUIwithDBdata();
}

function updateUIwithDBdata() {
    // Update the UI according the settings
    toggleSeaMapLayer(jsObject["use_OpenSeaMap"] === "true");
}

function initSettingsDialogWidgets() {
    // set checked state according to the data in the objects
    Switch_GPS.checked = jsObject["is_android_GPS_used"] === "true";
    Switch_orientation.checked = jsObject["is_android_orientation_used"] === "true";
    Switch_OpenSeaMap_tile.checked = jsObject["use_OpenSeaMap"] === "true";
    inputInterpolatedThresold.value = jsObject["distance_to_interpolated_point_max"];
    servoMaxChange.value = jsObject["servo_max_change"];
    kP.value = jsObject["kP"];
    kI.value = jsObject["kI"];
    kD.value = jsObject["kD"];
    dT.value = jsObject["dT"];
}


SaveSettingsButton.addEventListener("click", function () {
    // Update DB
    updateSettingsDatabase(); 
    // Send settings via bluetooth
    sendSettingsViaBLE();
    // Update the UI according the settings
    updateUIwithDBdata();
});

Switch_GPS.addEventListener("change", function () {
  // Change object value of the key 'is_android_GPS_used' to the checked state of the switch
  jsObject["is_android_GPS_used"] = Switch_GPS.checked;
});

Switch_orientation.addEventListener("change", function () {
    // Change object value of the key 'is_android_orientation_used' to the checked state of the switch
    jsObject["is_android_orientation_used"] = Switch_orientation.checked;
  });

  Switch_OpenSeaMap_tile.addEventListener("change", function () {
    // Change object value of the key 'use_OpenSeaMap' to the checked state of the switch
    jsObject["use_OpenSeaMap"] = Switch_OpenSeaMap_tile.checked;
  });

inputInterpolatedThresold.addEventListener("change", function () {
    jsObject["distance_to_interpolated_point_max"] = inputInterpolatedThresold.value;
});
  
servoMaxChange.addEventListener("input", function () {
    // Ensure the value is an integer
    const value = parseFloat(servoMaxChange.value);
    if (!isNaN(value)) {
        servoMaxChange.value = Math.round(value); // Display integer value
    }
});

servoMaxChange.addEventListener("change", function () {
    // Update the jsObject with the integer value
    jsObject["servo_max_change"] = parseInt(servoMaxChange.value, 10);
});

kP.addEventListener("change", function () {
    jsObject["kP"] = kP.value;
});
kI.addEventListener("change", function () {
    jsObject["kI"] = kI.value;
});
kD.addEventListener("change", function () {
    jsObject["kD"] = kD.value;
});
dT.addEventListener("change", function () {
    jsObject["dT"] = dT.value;
});


// Reads db and initializes settis dialog widgets on startup
  getAllSettingsData();
  initSettingsDialogWidgets();