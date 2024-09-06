package com.my.VeneilyApp.BluetoothLE;

import android.Manifest;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.LayoutInflater;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;

import com.my.VeneilyApp.JavaScriptInterface;

import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class BLEHandler {
    private static final String TAG = "BLEHandler";
    private static final String ESP32_SERVICE_NAME = "ESP32 Service";
    private static final String TARGET_SERVICE_UUID = "58ecb6f1-887b-487d-a378-0f9048c505da"; // Replace with your service UUID
    private static final UUID CHARACTERISTIC_UUID = UUID.fromString("2f926b0c-c378-474e-8ced-3194b815aedd");
    private static final long SCAN_PERIOD = 10000; // Stops scanning after 10 seconds.

    private BluetoothLeScanner bluetoothLeScanner;

    private BluetoothAdapter bluetoothAdapter;
    private BluetoothGatt bluetoothGatt;
    private Context context;
    private Activity activity;

    private Handler handler;
    private boolean isScanning;
    private boolean specificDeviceFound;
    private Map<String, String> characteristicDataMap;
    private Map<String, String> notificationMessages;

    private boolean isWritingCharacteristic = false;
    private static final UUID SERVICE_UUID = UUID.fromString("58ecb6f1-887b-487d-a378-0f9048c505da");
    public static final UUID CURRENT_LOCATION_CHARACTERISTIC_UUID = UUID.fromString("e0a432d7-8e2c-4380-b4b2-1568aa0412a3");
    public static final UUID ROUTE_COORDINATE_CHARACTERISTIC_UUID = UUID.fromString("20e88205-d8cd-42a9-bcfa-4b599484d362");
    public static final UUID MANUAL_MODE_DATA_CHARACTERISTIC_UUID = UUID.fromString("2f926b0c-c378-474e-8ced-3194b815aedd");
    public static final UUID OUTBOARDMOTOR_CHARACTERISTIC_UUID = UUID.fromString("f53de08c-1c0c-459a-a6d5-cd26a1523060");
    public static final UUID ANDROID_SETTINGS_CHARACTERISTIC_UUID = UUID.fromString("33c5c3d4-276d-42fc-88cd-c97422441bc1");
    public static final UUID ERROR_MESSAGES_CHARACTERISTIC_UUID = UUID.fromString("1e41b064-7652-41ad-b723-71540355bf4c");
    private static final int REQUEST_ENABLE_BT = 1;
    private static final int REQUEST_BT_SCAN = 1;
    private LayoutInflater mInflater;

    private LeDeviceListAdapter leDeviceListAdapter = new LeDeviceListAdapter(mInflater);

    public BLEHandler(@NonNull Activity activity, Context context) {
        this.context = context;
        this.activity = activity;
        this.handler = new Handler();
        BluetoothManager bluetoothManager = (BluetoothManager) activity.getSystemService(Context.BLUETOOTH_SERVICE);
        if (bluetoothManager != null) {
            bluetoothAdapter = bluetoothManager.getAdapter();
            bluetoothLeScanner = bluetoothAdapter.getBluetoothLeScanner();

            // Check if Bluetooth is enabled, if not request to enable it
            if (bluetoothAdapter != null && !bluetoothAdapter.isEnabled()) {
                Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
                if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                }
                activity.startActivityForResult(enableBtIntent, REQUEST_ENABLE_BT);
            }
        }
        characteristicDataMap = new HashMap<>();
        Log.d(TAG, "BLEHandler initialized");

        // Initialize notificationMessages map with all possible notification strings
        notificationMessages = new HashMap<>();
        populateMessages();
    }

    private final ScanCallback scanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            BluetoothDevice device = result.getDevice();
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                Log.w(TAG, "BLUETOOTH_CONNECT permission not granted");
                ActivityCompat.requestPermissions(activity, new String[]{Manifest.permission.BLUETOOTH_CONNECT}, REQUEST_ENABLE_BT);
                return;
            }
            Log.d(TAG, "Scan result: " + device.getName());
            if (ESP32_SERVICE_NAME.equals(device.getName())) {
                Log.d(TAG, "Found target device: " + device.getName());
                stopScanning();
                // Create a GATT connection to the selected BLE device
                bluetoothGatt = device.connectGatt(context, false, gattCallback);
                specificDeviceFound = true;
            }
        }

        @Override
        public void onBatchScanResults(java.util.List<ScanResult> results) {
            for (ScanResult result : results) {
                BluetoothDevice device = result.getDevice();
                if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                    Log.w(TAG, "BLUETOOTH_CONNECT permission not granted");
                    return;
                }
                Log.d(TAG, "Batch scan result: " + device.getName());
                if (ESP32_SERVICE_NAME.equals(device.getName())) {
                    Log.d(TAG, "Found target device in batch: " + device.getName());
                    stopScanning();
                    device.connectGatt(context, false, gattCallback);
                    break;
                }
            }
        }

        @Override
        public void onScanFailed(int errorCode) {
            Log.e(TAG, "Scan failed with error code: " + errorCode);
        }
    };

    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            super.onConnectionStateChange(gatt, status, newState);
            Log.d(TAG, "onConnectionStateChange: status=" + status + ", newState=" + newState);
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                Log.d(TAG, "Connected to GATT server");
                if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                    Log.w(TAG, "BLUETOOTH_CONNECT permission not granted");
                    return;
                }
                gatt.discoverServices();
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                Log.d(TAG, "Disconnected from GATT server");
                gatt.close();
                bluetoothGatt = null;
                specificDeviceFound = false;
            }
            // Call JavaScript from UI thread to set connection state accordingly
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                @Override
                public void run() {
                    JavaScriptInterface.callJavaScriptFunction("setBluetoothConnectionStateText('" + newState + "');");

                }
            });
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Log.d(TAG, "Services discovered");
                BluetoothGattService service = gatt.getService(UUID.fromString(TARGET_SERVICE_UUID));
                if (service != null) {
                    for (BluetoothGattCharacteristic characteristic : service.getCharacteristics()) {
                        if ((characteristic.getProperties() & BluetoothGattCharacteristic.PROPERTY_NOTIFY) > 0) {
                            Log.d(TAG, "Enabling notifications for characteristic: " + characteristic.getUuid());
                            setCharacteristicNotification(gatt, characteristic, true);
                        }
                    }
                }
            } else {
                Log.w(TAG, "onServicesDiscovered received: " + status);
            }
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Log.d(TAG, "Characteristic write successful: " + characteristic.getUuid());
                // If write successful, remove the characteristic from the map
                characteristicDataMap.remove(characteristic.getUuid().toString());
            } else {
                Log.e(TAG, "Characteristic write failed for characteristic: " + characteristic.getUuid() + " with status: " + status);
            }
            // Call method to handle completed write operation
            writeNextCharacteristic();
        }

        @Override
        public void onCharacteristicRead(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                // Process the received value
                byte[] value = characteristic.getValue();
                String stringValue = new String(value, StandardCharsets.UTF_8);  // Convert using UTF-8 encoding
                Log.d(TAG, "Read data: " + stringValue);

                // Check if the characteristic UUID is ERROR_MESSAGES_CHARACTERISTIC_UUID and call JS function
                UUID characteristicUUID = characteristic.getUuid();
                if (characteristicUUID.equals(ERROR_MESSAGES_CHARACTERISTIC_UUID)) {
                    // Split the stringValue at the first ";" character
                    String[] parts = stringValue.split(";", 2);
                    // Parse stringValue to first ";" and the string before it is the severity and the string after it is the message
                    if (parts.length == 2) {
                        String severity = parts[0];
                        String message = parts[1];

                        // Send the message to the message logger in JS
                        new Handler(Looper.getMainLooper()).post(new Runnable() {
                            @Override
                            public void run() {
                                JavaScriptInterface.callJavaScriptFunction("logMessage('" + message + "','" + severity + "');");
                            }
                        });
                    } else {
                        Log.e(TAG, "Invalid message format: " + stringValue);
                    }
                }


            } else {
                Log.e(TAG, "Characteristic read failed with status: " + status);
            }
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, byte[] value) {
            super.onCharacteristicChanged(gatt, characteristic, value);
            // This method will be called whenever the server sends a notification
            // Handle the received data here
            String message = new String(value, StandardCharsets.UTF_8);
            int splitIndex = 4;
            String part1 = message.substring(0, splitIndex);
            String part2 = message.substring(splitIndex);
            String tag = part1;
            // Process the received message
            Log.d(TAG, "Received notification with tag: " + tag);
            Log.d(TAG, "Full message: " + message);

            String severity = getSeverity(tag);
            String notificationMessage = getMessage(tag);
            // Check if the characteristic UUID is ERROR_MESSAGES_CHARACTERISTIC_UUID and call JS function
            UUID characteristicUUID = characteristic.getUuid();
            if (characteristicUUID.equals(ERROR_MESSAGES_CHARACTERISTIC_UUID)) {
                if (severity != "Unknown") {
                    // Check if the message should contain a variable with function checkIfSecondCharIsOne()
                    if (checkIfSecondCharIsOne(tag)) {
                        // split String message after fourth character
                        // And combine String notificationMessage with the second part of the String message
                        notificationMessage = notificationMessage + " " + part2;

                    }
                    // Send the message to the message logger in JS
                    String finalNotificationMessage = notificationMessage;
                    new Handler(Looper.getMainLooper()).post(new Runnable() {
                        @Override
                        public void run() {
                            JavaScriptInterface.callJavaScriptFunction("logMessage('" + finalNotificationMessage + "','" + severity + "');");
                            if (tag.equals("1104")) {
                                JavaScriptInterface.callJavaScriptFunction("drawLockModeLine('" + part2 + "');");
                            }
                            else if (tag.equals("1004")) {
                                JavaScriptInterface.callJavaScriptFunction("stopAutoMode();");
                            }
                        }
                    });
                }
                else {
                    // Do read request instead
                    updateCharacteristicData(characteristic.getUuid().toString(), message, true); // Mark as a read request
                }
            }
        }
    };

    // Method to initiate a read request for a characteristic
    private void initiateReadRequest(String characteristicUuid) {
        if (bluetoothGatt == null) {
            Log.e(TAG, "BluetoothGatt not initialized");
            return;
        }
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            return;
        }
        BluetoothGattCharacteristic characteristic = bluetoothGatt.getService(SERVICE_UUID).getCharacteristic(UUID.fromString(characteristicUuid));
        boolean success = bluetoothGatt.readCharacteristic(characteristic);
        if (!success) {
            Log.e(TAG, "Characteristic write failed for characteristic: " + characteristic.getUuid());
            isWritingCharacteristic = false;
            initiateReadRequest(characteristicUuid); // Try writing the next characteristic
        }
        else {
            Log.d(TAG, "Read request initiated successfully for characteristic: " + characteristicUuid);
        }
    }

    private void setCharacteristicNotification(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic, boolean enabled) {
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
            Log.w(TAG, "BLUETOOTH_CONNECT permission not granted");
            return;
        }
        gatt.setCharacteristicNotification(characteristic, enabled);
        BluetoothGattDescriptor descriptor = characteristic.getDescriptor(UUID.fromString("00002902-0000-1000-8000-00805f9b34fb"));
        if (descriptor != null) {
            descriptor.setValue(enabled ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);
            gatt.writeDescriptor(descriptor);
            Log.d(TAG, "Descriptor write initiated for characteristic: " + characteristic.getUuid());
        }
    }

    // Method to add or update characteristic data in the map
    private synchronized void updateCharacteristicData(String characteristicUuid, String data, boolean isRead) {
        Log.d("my_debug_tag", "updateCharacteristicData: " + data);
        characteristicDataMap.put(characteristicUuid, data);
        if (!isWritingCharacteristic) {
            // If not currently writing, trigger writing/reading the next characteristic
            if (isRead) {
                initiateReadRequest(characteristicUuid); // Initiate a read request
            } else {
                writeNextCharacteristic(); // Initiate a write request
            }
        }
    }

    // Method to write the next characteristic from the map
    private synchronized void writeNextCharacteristic() {
        if (!characteristicDataMap.isEmpty()) {
            isWritingCharacteristic = true;
            Map.Entry<String, String> entry = characteristicDataMap.entrySet().iterator().next();
            String characteristicUuid = entry.getKey();
            String data = entry.getValue();
            BluetoothGattCharacteristic characteristic = bluetoothGatt.getService(UUID.fromString(TARGET_SERVICE_UUID)).getCharacteristic(UUID.fromString(characteristicUuid));
            characteristic.setValue(data);
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                return;
            }
            boolean success = bluetoothGatt.writeCharacteristic(characteristic);
            if (!success) {
                Log.e(TAG, "Characteristic write failed for characteristic: " + characteristic.getUuid());
                isWritingCharacteristic = false;
                writeNextCharacteristic(); // Try writing the next characteristic
            }
        } else {
            isWritingCharacteristic = false;
        }
    }

    public void writeCharacteristic(String characteristicUuid, String data) {
        if (bluetoothGatt == null) {
            Log.w(TAG, "BluetoothGatt not initialized");
            return;
        }

        BluetoothGattService service = bluetoothGatt.getService(UUID.fromString(TARGET_SERVICE_UUID));
        if (service == null) {
            Log.w(TAG, "Service not found on writeCharacteristic: " + TARGET_SERVICE_UUID);
            return;
        }

        BluetoothGattCharacteristic characteristic = service.getCharacteristic(UUID.fromString(characteristicUuid));
        if (characteristic == null) {
            Log.w(TAG, "Characteristic not found: " + characteristicUuid);
            return;
        }
        updateCharacteristicData(characteristicUuid, data, false);
    }


    public void startScanning() {
        // Request permission first
        if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
            Log.w(TAG, "BLUETOOTH_SCAN permission not granted");
            ActivityCompat.requestPermissions(activity, new String[]{Manifest.permission.BLUETOOTH_SCAN}, REQUEST_BT_SCAN);
            return;
        }

        if (bluetoothLeScanner != null && !isScanning) {
            handler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    stopScanning();
                    Log.d(TAG, "Scanning period exceeded, device found is " + specificDeviceFound);
                    if (!specificDeviceFound) {
                        int deviceWasNotFound = 11; // An id to tell javaScript that device was not found
                        JavaScriptInterface.callJavaScriptFunction("setBluetoothConnectionStateText('" + deviceWasNotFound + "');");
                    }
                }
            }, SCAN_PERIOD);
            isScanning = true;

            ScanFilter scanFilter = new ScanFilter.Builder().build();
            ScanSettings scanSettings = new ScanSettings.Builder()

                    .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
                    .build();

            bluetoothLeScanner.startScan(Collections.singletonList(scanFilter), scanSettings, scanCallback);
            Log.d(TAG, "Scanning started");

            // Run this part on the UI thread
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                @Override
                public void run() {
                    int scanningStarted = 12; // An id to tell JavaScript that scanning is started
                    JavaScriptInterface.callJavaScriptFunction("setBluetoothConnectionStateText('" + scanningStarted + "');");
                }
            });
        }
    }



    public void stopScanning() {
        if (bluetoothLeScanner != null && isScanning) {
            isScanning = false;
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_SCAN) != PackageManager.PERMISSION_GRANTED) {
                Log.w(TAG, "BLUETOOTH_SCAN permission not granted");
                return;
            }
            bluetoothLeScanner.stopScan(scanCallback);
            Log.d(TAG, "Scanning stopped");
        }
    }

    public void disconnect() {
        if (bluetoothGatt != null) {
            if (ActivityCompat.checkSelfPermission(context, Manifest.permission.BLUETOOTH_CONNECT) != PackageManager.PERMISSION_GRANTED) {
                Log.w(TAG, "BLUETOOTH_CONNECT permission not granted");
                return;
            }
            bluetoothGatt.disconnect();
            Log.w(TAG, "Disconnected from GATT server and cleaned up");
        }
    }


    /*
    * Speficication of the values of the keys.
    * Initialized in the .cpp file
    * First digit of the value tells message severity:
    *  - 1: INFO
    *  - 2: WARNING
    *  - 3: ERROR
    * Second digit
    *  - 0: Means the message goes without any extra variables
    *  - 1: Means the message takes also an extra variable value
    * Third and fourth digit
    *  - are just identifiers
    */
    // Method to populate the map with predefined messages
    private void populateMessages() {
        // Info messages start with "1xxx"
        // Warning messages start with "2xxx"
        // Error messages start with "3xxx"
        notificationMessages.put("1000", "Route should now be started successfully");
        notificationMessages.put("1001", "Route should now be stopped successfully");
        notificationMessages.put("1002", "Orientation for route mode should now be initialized successfully");
        notificationMessages.put("1003", "Motor speed set to zero on anchor mode");
        notificationMessages.put("1004", "Route completed successfully");
        notificationMessages.put("1103", "Next route coordinate index updated to");
        notificationMessages.put("1104", "Direction coordinate used in lock mode");
    }

    // Method to retrieve a message by its tag
    public String getMessage(String tag) {
        return notificationMessages.get(tag);
    }

    // Method to determine the severity of a message based on its tag
    private String getSeverity(String tag) {
        if (tag.startsWith("1")) {
            return "Info";
        } else if (tag.startsWith("2")) {
            return "Warning";
        } else if (tag.startsWith("3")) {
            return "Error";
        } else {
            return "Unknown";
        }
    }

    private boolean checkIfSecondCharIsOne(String tag) {
        if (tag.charAt(1) == '1') {
            return true;
    }
        else {
            return false;
        }
    }

}



