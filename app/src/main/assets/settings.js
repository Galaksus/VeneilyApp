const SaveSettingsButton = document.getElementById("save-settings-button");
const Switch_GPS = document.getElementById("Switch-GPS");
const Switch_orientation = document.getElementById("Switch-orientation");
const inputInterpolatedThresold = document.getElementById("distance-to-interpolated-point-threshold");

// The settings, C++ equivalent of struct and JavaScript object (dict), where key equals table's column name and value the value for the column (string)
var jsObject = {
    is_android_GPS_used: 'false',
    is_android_orientation_used: 'false',
    distance_to_interpolated_point_threshold: 8
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

}

function initSettingsDialogWidgets() {
    // set checked state according to the data in the objects
    Switch_GPS.checked = jsObject["is_android_GPS_used"] === "true";
    Switch_orientation.checked = jsObject["is_android_orientation_used"] === "true";
    inputInterpolatedThresold.value = jsObject["distance_to_interpolated_point_threshold"];
}


SaveSettingsButton.addEventListener("click", function () {
    // Update DB
    updateSettingsDatabase(); 
    // Send settings via bluetooth
    sendSettingsViaBLE();
});

Switch_GPS.addEventListener("change", function () {
  // Change object value of the key 'is_android_GPS_used' to the checked state of the switch
  jsObject["is_android_GPS_used"] = Switch_GPS.checked;
});

Switch_orientation.addEventListener("change", function () {
    // Change object value of the key 'is_android_orientation_used' to the checked state of the switch
    jsObject["is_android_orientation_used"] = Switch_orientation.checked;
  });

inputInterpolatedThresold.addEventListener("change", function () {
    jsObject["distance_to_interpolated_point_threshold"] = inputInterpolatedThresold.value;
});
  
// Reads db and initializes settis dialog widgets on startup
  getAllSettingsData();
  initSettingsDialogWidgets();