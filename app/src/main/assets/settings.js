const SaveSettingsButton = document.getElementById("save-settings-button");
const Switch_GPS = document.getElementById("Switch-GPS");
const Switch_orientation = document.getElementById("Switch-orientation");


// JavaScript object (dict), where key equals table's column name and value the value for the column (string)
var jsObject = {
    is_android_GPS_used: 'false',
    is_android_orientation_used: 'false'
    //key3: 'value3' // add more column names and values when needed
};


function updateSettingsDatabase() {
    /*
    * Updates the settings table in the database
    */
    // Convert the JavaScript object to a JSON string
    var jsonString = JSON.stringify(jsObject);
    console.log(jsonString);
    // Call the Java function with the JSON string as a parameter
    Android.updateSettingsDB(jsonString);
    // Creates a message that shows that settings are saved
    createMessage(SaveSettingsButton, "Settings saved", "settings-saved-message", "green");
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

}

function initSettingsDialogWidgets() {
    // set checked state according to the data in the objects
    Switch_GPS.checked = jsObject["is_android_GPS_used"] === "true";
    Switch_orientation.checked = jsObject["is_android_orientation_used"] === "true";
}


SaveSettingsButton.addEventListener("click", function () {
    // Update DB
    updateSettingsDatabase(); 
});

Switch_GPS.addEventListener("change", function () {
  // Change object value of the key 'is_android_GPS_used' to the checked state of the switch
  jsObject["is_android_GPS_used"] = Switch_GPS.checked;
});

Switch_orientation.addEventListener("change", function () {
    // Change object value of the key 'is_android_orientation_used' to the checked state of the switch
    jsObject["is_android_orientation_used"] = Switch_orientation.checked;
  });
  
// Reads db and initializes settis dialog widgets on startup
  getAllSettingsData();
  initSettingsDialogWidgets();