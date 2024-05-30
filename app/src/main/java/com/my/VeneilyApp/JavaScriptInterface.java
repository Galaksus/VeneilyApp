package com.my.VeneilyApp;


import static com.my.VeneilyApp.MainActivity.mywebView;

import android.app.Activity;
import android.content.Context;
import android.hardware.SensorManager;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import com.my.VeneilyApp.BluetoothLE.BLEHandler;
import com.my.VeneilyApp.data.DataAccessObject;
import com.my.VeneilyApp.data.FeedReaderContract;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class JavaScriptInterface implements GetOrientation.OrientationListener {
    private Context context;
    private Activity mainActivity;
    private DataAccessObject DataAccessObject;
    BLEHandler blehandler;
    private SensorManager sensorManager;
    private float azimuthDegrees_;
    private final GetLocation getLocation;
    public JavaScriptInterface(Context context, GetLocation getLocation, Activity activity) {
        this.context = context;
        mainActivity = activity;
        this.sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);
        DataAccessObject = new DataAccessObject(context);
        this.getLocation = getLocation;
        blehandler = new BLEHandler(mainActivity, this.context);
        // Start getting orientation updates
        // Instantiate GetOrientation and set it up
        GetOrientation  getOrientation = new GetOrientation(context, this);
    }

    // New route data from JavaScript to Java
    @JavascriptInterface
    public void newRouteCreated(String coordinateString, String routeType, String name) {
        // Insert data to db
        Log.d("mydebug", "coordinateString/routeType/name: "+coordinateString+", "+ routeType+", "+ name);

        insertData(name, coordinateString, routeType);
        Toast.makeText(context, "Route: '" + name + "' was created", Toast.LENGTH_LONG).show();

    }

    @JavascriptInterface
    public void getCurrentLocation() {
        getLocation.getCurrentLocationOnce(mainActivity, new LocationCallback() {
            @Override
            public void onLocationReceived(String latitude, String longitude) {
                // Handle the location data here
                String javascriptCode = "setViewOnCurrentLocation(" + latitude + ", " + longitude + ");";
                Log.d("mydebug", "Lat/lon: "+latitude+", "+ longitude);

                // Excecutes javascript function and draws the circle in the map
                mywebView.evaluateJavascript(javascriptCode, null);
            }

            @Override
            public void onLocationFailed() {
                // Not in use at the moment
                Log.e("LocationFail", "Location failed");

            }
        });
    }

    @JavascriptInterface
    public void toastMessageFromJS(String toastMessage) {
        Toast.makeText(context, toastMessage, Toast.LENGTH_LONG).show();
    }

    @JavascriptInterface
    public void connectBluetooth() {
        // Start scanning for esp32 and connect to it if found
        blehandler.startScanning();
        Log.e("bluetoothscan", "Connect attempted");

    }

    @JavascriptInterface
    public void disconnectBluetooth() {
        // Disconnects bluetooth on the main thread
        mainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                blehandler.disconnect();
                Log.e("bluetoothscan", "Disconnect attempted");
            }
        });
    }



    @JavascriptInterface
    public void JSToBLEInterfaceSliders(String uuid, String data) {
        // There will be many send requests failing but it is fine...
        // with a while loop this doesn't work smoothly like in other similar functions that I use
        //boolean success = false;
        //// Try to write the characteristic
        //success = blehandler.writeCharacteristicWithData(uuid, data);
        writeCharacteristic(uuid, data);

    }

    @JavascriptInterface
    public void JSToBLEInterface(String uuid, String data) {
        long startTime = System.currentTimeMillis();
        long timeout = 1000; // 1 second timeout
        boolean success = false;

        /*while (!success) {
            // Check if timeout has been reached
            if (System.currentTimeMillis() - startTime > timeout) {
                // Timeout reached, break out of the loop
                Log.e("bluetoothscan", "JSToBLEInterface function exceeded timeout time!!!");
                break;
            }

            // Try to write the characteristic
            success = blehandler.writeCharacteristic(uuid, data);
        }*/
        writeCharacteristic(uuid, data);

    }


    @JavascriptInterface
    public void JSToBLEInterfaceSelectedRoute(String uuid, int selectedRoute) {
        Log.e("testailu", "UUID: " +uuid+ " selectedRoute int: "+selectedRoute);

        // No route selected
        if (selectedRoute == 0) {
            return;
        }

        // trim the string that is to be sent
        String allRouteCoordinates = dataStringTrimmer(DataAccessObject.getData(selectedRoute, FeedReaderContract.FeedEntry.COLUMN_NAME_COORDINATESTRING));
        // retrieve also the route type
        String routeType = DataAccessObject.getData(selectedRoute, FeedReaderContract.FeedEntry.COLUMN_NAME_TYPE) + ";";
        // combine the strings
        String allDataRouteString = routeType + allRouteCoordinates;

        /*
        // Safety mechanism to stop the loop if exceeds over "timeout" seconds
        long startTime = System.currentTimeMillis();
        long timeout = 1000; // 1 second timeout
        boolean success = false;
        // Send all route coordinates and route type to remote BLE device, while loop should ensure the data is sent correctly
        while (!success) {
            // Check if timeout has been reached
            if (System.currentTimeMillis() - startTime > timeout) {
                // Timeout reached, break out of the loop
                Log.e("bluetoothscan", "JSToBLEInterfaceSelectedRoute function exceeded timeout time!!!");
                break;
            }

            // Try to write the characteristic
            success = blehandler.writeCharacteristic(uuid, allDataRouteString);
        }
        */

        writeCharacteristic(uuid, allDataRouteString);


    }
        @JavascriptInterface
    public void JSToBLEInterfaceGPSandOri(String uuid, String isAndroidGPSinUse, String isAndroidOrientationInUse) {
            Log.e("testailu: ", isAndroidGPSinUse + isAndroidOrientationInUse + azimuthDegrees_);
            final String[] BLEStringToBeSent = {""};
            String orientationString = "";

            if (isAndroidOrientationInUse.equals("true")) {
                orientationString = String.valueOf(azimuthDegrees_);
            }

            String finalOrientationString = orientationString;
            getLocation.getCurrentLocationOnce(mainActivity, new LocationCallback() {
            @Override
            public void onLocationReceived(String latitude, String longitude) {
                String locationData = "";
                if (isAndroidGPSinUse.equals("true")) {
                    locationData = latitude + ", " + longitude;
                }
                BLEStringToBeSent[0] = locationData + ";" + finalOrientationString;

                blehandler.writeCharacteristic(uuid, BLEStringToBeSent[0]);
            }

            @Override
            public void onLocationFailed() {
                // Not in use at the moment
                Log.e("LocationFail", "Location failed");

            }
        });
    }


    private void writeCharacteristic(String uuid, String data) {
        blehandler.writeCharacteristic(uuid, data);
    }

    /* Database related methods */
    // insert data into the database
    public void insertData(String name, String coordinateString, String routeType) {
        DataAccessObject.insertData(name, coordinateString, routeType);
    }

    // retrieve data from the database
   @JavascriptInterface
    public String getData(int id, boolean onlyLastColumn) {
       return DataAccessObject.getData(id, onlyLastColumn);
    }

    public String getData(int id, String columnName) {
        Log.e("käykö", "columnName");

        return DataAccessObject.getData(id, columnName);
    }


    @JavascriptInterface
    public void deleteRowFromDb(long rowID){
        // deletes the specific row
        DataAccessObject.deleteRow(rowID);

    }
    @JavascriptInterface
    public void updateSettingsDB(String jsonString) {
        try {
            // Parse the JSON string into a JSONObject
            JSONObject jsonObject = new JSONObject(jsonString);

            // Get the keys of the JSON object
            Iterator<String> keys = jsonObject.keys();

            // Iterate over the keys and call your function for each key-value pair
            while (keys.hasNext()) {
                String key = keys.next();
                String value = jsonObject.getString(key);
                // Call your function with each key-value pair
                DataAccessObject.updateSettingsTable(key, value);
            }
        } catch (JSONException e) {
            e.printStackTrace();
            // Handle JSON parsing error
        }
    }

    @JavascriptInterface
    public String getSettingsData() {
        return DataAccessObject.getAllSettingsDataAsJson();
    }

    public static void callJavaScriptFunction(String javascriptCode){
        // Execute JavaScript function
        Log.e("käykö", javascriptCode);

        mywebView.evaluateJavascript(javascriptCode, null);
    }


    private String dataStringTrimmer(String currentRouteData) {
        Log.d("listan loggaus", currentRouteData);

        // Extract the coordinates using regex
        Pattern pattern = Pattern.compile("LatLng\\((\\d+\\.\\d+), (\\d+\\.\\d+)\\)");
        Matcher matcher = pattern.matcher(currentRouteData);
        List<String> coordinates = new ArrayList<>();
        while (matcher.find()) {
            double lat = Double.parseDouble(matcher.group(1));
            double lng = Double.parseDouble(matcher.group(2));
            coordinates.add(lat + "," + lng);
        }

        // Convert the list of coordinates to a string
        return String.join(";", coordinates);
    }

    @Override
    public void onOrientationChanged(float azimuth, float pitch, float roll) {
        // Do something with the orientation data in your other class
        Log.d("OrientationTAG2: ", String.valueOf(roll));
        // Convert radians to degrees if needed
        float azimuthDegrees = (float) Math.toDegrees(azimuth);
        float pitchDegrees = (float) Math.toDegrees(pitch);
        float rollDegrees = (float) Math.toDegrees(roll);
        azimuthDegrees_ = azimuthDegrees;
        Log.d("OrientationTAG2: ", "Deg: " + String.valueOf(azimuthDegrees_));

        callJavaScriptFunction("setMarkerRotation('"+azimuthDegrees+"');"); // Call the desired JS function with the orientation data
    }

    public interface LocationCallback {
        void onLocationReceived(String latitude, String longitude);
        void onLocationFailed();
    }
}

