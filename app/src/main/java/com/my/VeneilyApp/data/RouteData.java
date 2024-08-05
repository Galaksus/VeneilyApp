package com.my.VeneilyApp.data;

import android.provider.BaseColumns;

public final class RouteData {
    // To prevent someone from accidentally instantiating the contract class,
    // make the constructor private.
    private RouteData() {}

    // Inner class that defines the table contents
    public static class FeedEntry implements BaseColumns {
        public static final String TABLE_NAME = "Routes";
        public static final String COLUMN_NAME_TITLE = "title";
        public static final String COLUMN_NAME_COORDINATESTRING = "CoordinateString";
        public static final String COLUMN_NAME_TYPE = "routeType";
    }
}
