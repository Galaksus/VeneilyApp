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

import java.util.ArrayList;
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
        // Creates new instance everytime this method is called, also calls the startLeDeviceScanning
        //blehandler = new BLEHandler(mainActivity, this.context);
        blehandler.startLeDeviceScanning();
    }

    @JavascriptInterface
    public void JSToBLEInterface(int id, int value, String data) {
        /**
         * "String data" is null if it is not desired to be sent via BLE within this function call
          */
        boolean bleWriteSuccessful = false;
        if (data == null) {
            bleWriteSuccessful = blehandler.writeCharacteristicWithData(getCorrectUUID(id), String.valueOf(value) /*convertedValue*/);
        }
        else {
            bleWriteSuccessful = blehandler.writeCharacteristicWithData(getCorrectUUID(id), data /*convertedValue*/);

        }

        Log.e("mydebug2", "Elmentti: " +id+ " value: "+data);

        // Calls bluetooth write method
        //blehandler.writeCharacteristicWithData(uuid, String.valueOf(value) /*convertedValue*/);
        //blehandler.writeCharacteristicWithData(getCorrectUUID(id), String.valueOf(value) /*convertedValue*/);
    }

    @JavascriptInterface
    public void JSToBLEInterface(int id, int selectedRoute) {
        Log.e("mydebug2", "ID: " +id+ " selectedRoute: "+selectedRoute);

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

        // Send all route coordinates and route type to remote BLE device, while loop should ensure the data is sent correctly
        while (!blehandler.writeCharacteristicWithData(getCorrectUUID(id), allDataRouteString)) {
            blehandler.writeCharacteristicWithData(getCorrectUUID(id), allDataRouteString);
        }
    }
        @JavascriptInterface
    public void JSToBLEInterface(int id) {

        getLocation.getCurrentLocationOnce(mainActivity, new LocationCallback() {

            @Override
            public void onLocationReceived(String latitude, String longitude) {
                String locationData = latitude + ", " + longitude;

                blehandler.writeCharacteristicWithData(getCorrectUUID(id), locationData);
            }

            @Override
            public void onLocationFailed() {
                // Not in use at the moment
                Log.e("LocationFail", "Location failed");

            }
        });
    }


    UUID getCorrectUUID(int id){
        UUID uuid = null;
        if (id == 0) {
            uuid = BLEHandler.MANUAL_MODE_DATA_CHARACTERISTIC_UUID;
        }
        else if (id == 1) {
            uuid = BLEHandler.OUTBOARDMOTOR_CHARACTERISTIC_UUID;
        }
        else if (id == 2){
            uuid = BLEHandler.CURRENT_LOCATION_CHARACTERISTIC_UUID;
        }
        else if (id == 3){
            uuid = BLEHandler.ROUTE_COORDINATE_CHARACTERISTIC_UUID;
        }
        return uuid;
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

        callJavaScriptFunction("setMarkerRotation('"+azimuthDegrees+"');"); // Call the desired JS function with the orientation data
    }

    public interface LocationCallback {
        void onLocationReceived(String latitude, String longitude);
        void onLocationFailed();
    }
}

