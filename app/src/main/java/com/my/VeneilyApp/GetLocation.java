package com.my.VeneilyApp;
import static com.my.VeneilyApp.MainActivity.mywebView;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.Priority;

public class GetLocation {

    private static Context mContext;
    private static FusedLocationProviderClient mFusedLocationClient;
    private LocationCallback mLocationCallback;
    private LocationRequest locationRequest;
    private static final int REQUEST_LOCATION_PERMISSION = 1;
    private final int MAX_ALLOWED_ACCURACY_METERS = 20;
    public GetLocation(Context context) {
        mContext = context;
        mFusedLocationClient = LocationServices.getFusedLocationProviderClient(mContext);

        mLocationCallback = new LocationCallback() {
            private boolean locationReceivedWithinTimePeriod = false;
            private Handler handler = new Handler();
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) {
                    return;
                }

                for (Location location : locationResult.getLocations()) {
                    // Handle location updates here
                    Log.d("MYLOCATION", "Lat: " + location.getLatitude() + ", Lon: " + location.getLongitude());

                    // Converts getLatitude and getLongitude to String
                    String latitude = String.valueOf(location.getLatitude());
                    String longitude = String.valueOf(location.getLongitude());
                    String locationData = latitude + ", " + longitude;
                    String javascriptCode = "drawCircleOnCurrentLocationOnMap(" + locationData + ");";
                    // Execute javascript function and draw the circle in the map
                    // that indicates the current location
                    mywebView.evaluateJavascript(javascriptCode, null);

                    if (location.getAccuracy() > MAX_ALLOWED_ACCURACY_METERS) {
                        // Handle location updates here
                        Log.d("MYLOCATION", "Current location prevented from BLE due to accuracy: " + location.getAccuracy() + " meters");
                        //TODO tähän joku GPS-signal issue ilmotus javaSriptiin?
                    //  if (BluetoothBLECommunication.getConnectionState() /*&& routeStarted*/)
                    //        // JS-kutsu jossa tuodaan joku GPS connection state teksti esille
                    //    return;
                    }
                    else {
                    }


                }

            }
        };
    }

    public void startLocationUpdates(Activity activity) {
        // Check if permission to access location is granted
        if (ContextCompat.checkSelfPermission(mContext, Manifest.permission.ACCESS_FINE_LOCATION) !=
                PackageManager.PERMISSION_GRANTED) {
            // Permission is not granted, request it
            ActivityCompat.requestPermissions(activity,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    REQUEST_LOCATION_PERMISSION);
            return;
        }

        // TODO tähän noita argumenttejä lisää vai mitä noi on :D jos siis tarvii
        // TODO toki noita olemassa olevia voi muokata myös mielensä mukaan
        locationRequest = new LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, 1000)
                .setWaitForAccurateLocation(false)
                .setMinUpdateIntervalMillis(500) // Sets the fastest allowed interval of location updates.
                .setMaxUpdateDelayMillis(1000) // Sets the longest a location update may be delayed
                .build(); // Builds a new LocationRequest


        mFusedLocationClient.requestLocationUpdates(locationRequest,
                mLocationCallback,
                Looper.getMainLooper()); // Use the main looper to handle location updates
    }

    public void stopLocationUpdates() {
        // stops location updates
        mFusedLocationClient.removeLocationUpdates(mLocationCallback);
    }

    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions,
                                           @NonNull int[] grantResults) {
        if (requestCode == REQUEST_LOCATION_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startLocationUpdates((Activity) mContext);
            }
        }
    }

    public static void getCurrentLocationOnce(Activity activity, JavaScriptInterface.LocationCallback locationCallback) {
        if (ContextCompat.checkSelfPermission(mContext, Manifest.permission.ACCESS_FINE_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(activity,
                    new String[]{Manifest.permission.ACCESS_FINE_LOCATION},
                    REQUEST_LOCATION_PERMISSION);
            return;
        }

        mFusedLocationClient.getLastLocation()
                .addOnSuccessListener(activity, location -> {
                    if (location != null) {
                        // Convert coordinates to string
                        String latitude = String.valueOf(location.getLatitude());
                        String longitude = String.valueOf(location.getLongitude());

                        // Pass the coordinates to the callback
                        locationCallback.onLocationReceived(latitude, longitude);

                    } else {
                        Log.d("MYLOCATION", "MYLOCATION Failed to retrieve location.");
                    }
                });
    }

}

