package com.my.VeneilyApp.data;

import android.provider.BaseColumns;

public final class TestResultsTable {

        // To prevent someone from accidentally instantiating the contract class,
        // make the constructor private.
        private TestResultsTable() {}

    // Inner class that defines the table contents
    public static class FeedEntry implements BaseColumns {
        public static final String TABLE_NAME = "TestResults";
        public static final String ID = "id";
        public static final String COLUMN_SESSION_ID = "session_id";
        public static final String COLUMN_DATA = "data";
        public static final String ASSOCIATED_WITH = "associated_with";
        public static final String COLUMN_TIMESTAMP = "timestamp";

    }

}