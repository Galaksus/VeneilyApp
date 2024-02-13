package com.my.VeneilyApp.data;

import android.provider.BaseColumns;

public final class SettingsTable {
    // To prevent someone from accidentally instantiating the contract class,
    // make the constructor private.
    private SettingsTable() {}

    // Inner class that defines the table contents
    public static class FeedEntry implements BaseColumns {
        public static final String TABLE_NAME = "Settings";
        public static final String COLUMN_NAME_1 = "is_android_GPS_used";
        public static final String COLUMN_NAME_2 = "is_android_orientation_used";
        public static final String COLUMN_NAME_3 = "placeholder";
    }
}