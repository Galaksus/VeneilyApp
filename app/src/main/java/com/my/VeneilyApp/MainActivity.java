package com.my.VeneilyApp;

import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity  {

    private static final int REQUEST_LOCATION_PERMISSION = 1;
    public static WebView mywebView;
    GetLocation getLocation;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mywebView=(WebView) findViewById(R.id.webview);
        mywebView.setWebViewClient(new WebViewClient());

        // Starts getting location updates periodically
        getLocation = new GetLocation(this);
        getLocation.startLocationUpdates(this);


        // Create a new instance JavaScriptInterface and add it to the WebView
        JavaScriptInterface jsInterface = new JavaScriptInterface(this, getLocation, MainActivity.this);
        mywebView.addJavascriptInterface(jsInterface, "Android");

        // Load HTML to the Webview element
        mywebView.loadUrl("file:///android_asset/index.html");
        WebSettings webSettings=mywebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setAllowFileAccess(true);
        mywebView.setWebContentsDebuggingEnabled(true); // debuggausta varten

        // JavaScript ConsoleLoggings
        mywebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d("consolelog", consoleMessage.message() + " -- From line " +
                        consoleMessage.lineNumber() + " of " + consoleMessage.sourceId());
                return true;
            }
        });

        mywebView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                // Try to connect bluetooth
                // the BLE connection is called through jsInterface,
                // so that a correct instance is used for all BLE connection related things
                jsInterface.connectBluetooth();
            }
        });
    }



    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_LOCATION_PERMISSION) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission is granted, start location updates
                getLocation.startLocationUpdatesInternal();
            } else {
                // Permission denied, notify user about it
                Toast.makeText(this, "Location permission is required for the app to function properly", Toast.LENGTH_SHORT).show();
            }
        }
    }


    public class mywebClient extends WebViewClient {
        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view,url,favicon);
        }
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            view.loadUrl(url);
            return true;
        }
    }
    @Override
    public void onBackPressed() {
        if (mywebView.canGoBack()) {
            mywebView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}