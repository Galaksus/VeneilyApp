package com.my.VeneilyApp.data;

import android.provider.BaseColumns;

public final class SettingsTable {
    // To prevent someone from accidentally instantiating the contract class,
    // make the constructor private.
    private SettingsTable() {}

    // Inner class that defines the table contents
    public static class FeedEntry implements BaseColumns {
        public static final String TABLE_NAME = "Settings";
        public static final String is_android_GPS_used = "is_android_GPS_used";
        public static final String is_android_orientation_used = "is_android_orientation_used";
        public static final String distance_to_interpolated_point_max = "distance_to_interpolated_point_max";
        public static  final String servo_max_change = "servo_max_change";
        public static final String kP = "kP";
        public static final String kI = "kI";
        public static final String kD = "kD";
        public static final String dT = "dT";
        public static final String use_OpenSeaMap = "use_OpenSeaMap";

    }
}
