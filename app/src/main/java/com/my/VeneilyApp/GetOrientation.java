package com.my.VeneilyApp;

import android.content.Context;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.util.Log;

public class GetOrientation implements SensorEventListener {
    private static final String TAG = "OrientationTAG";
    private SensorManager sensorManager;
    private Sensor accelerometer;
    private Sensor magnetometer;
    private float[] mGravity;
    private float[] mGeomagnetic;
    private static final float ALPHA = 0.025f; // Adjust this value to control the filter strength
    private OrientationListener orientationListener;

    // Callback interface to notify another class about orientation changes
    public interface OrientationListener {
        void onOrientationChanged(float azimuth, float pitch, float roll);
    }

    public GetOrientation(Context context, OrientationListener listener) {
        this.orientationListener = listener;

        // Initialize the SensorManager
        sensorManager = (SensorManager) context.getSystemService(Context.SENSOR_SERVICE);

        // Initialize the accelerometer and magnetometer sensors
        accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        magnetometer = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);

        // Register the sensor listeners
        if (accelerometer != null && magnetometer != null) {
            sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_NORMAL);
            sensorManager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_NORMAL);
        }
    }

    @Override
    public void onSensorChanged(SensorEvent event) {
        if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER)
           // mGravity = event.values;
            mGravity = lowPassFilter(event.values.clone(), mGravity);
        if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD)
            //mGeomagnetic = event.values;
            mGeomagnetic = lowPassFilter(event.values.clone(), mGeomagnetic);

        if (mGravity != null && mGeomagnetic != null) {
            float R[] = new float[9];
            float I[] = new float[9];
            boolean success = SensorManager.getRotationMatrix(R, I, mGravity, mGeomagnetic);

            if (success) {
                float orientation[] = new float[3];
                SensorManager.getOrientation(R, orientation);
                float azimuth = orientation[0];
                float pitch = orientation[1];
                float roll = orientation[2];

                // Notify the listener about the orientation changes
                if (orientationListener != null) {
                    orientationListener.onOrientationChanged(azimuth, pitch, roll);
                }

                // Log the orientation values
               // Log.d(TAG, "Azimuth: " + azimuth);
               // Log.d(TAG, "Pitch: " + pitch);
               // Log.d(TAG, "Roll: " + roll);
            }
        }
    }

    // Apply a low-pass filter to sensor values
    private float[] lowPassFilter(float[] input, float[] output) {
        if (output == null) return input;

        for (int i = 0; i < input.length; i++) {
            output[i] = output[i] + ALPHA * (input[i] - output[i]);
        }
        return output;
    }
    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {
        // Handle accuracy changes if needed
    }

    public void unregisterListener() {
        // Unregister the sensor listeners to save power
        sensorManager.unregisterListener(this);
    }

    public void registerListener() {
        // Register the sensor listeners again
        if (accelerometer != null && magnetometer != null) {
            sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_NORMAL);
            sensorManager.registerListener(this, magnetometer, SensorManager.SENSOR_DELAY_NORMAL);
        }
    }
}