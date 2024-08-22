package com.my.VeneilyApp.data;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;


public class FeedReaderDbHelper extends SQLiteOpenHelper {
    private static final int DATABASE_VERSION = 1;
    private static final String DATABASE_NAME = "VeneilyAppDatabase.db";

    private static final String SQL_CREATE_ENTRIES =
            "CREATE TABLE " + RouteData.FeedEntry.TABLE_NAME + " (" +
                    RouteData.FeedEntry._ID + " INTEGER PRIMARY KEY," +
                    RouteData.FeedEntry.COLUMN_NAME_TITLE + " TEXT," +
                    RouteData.FeedEntry.COLUMN_NAME_COORDINATESTRING + " TEXT," +
                    RouteData.FeedEntry.COLUMN_NAME_TYPE + " TEXT)";

    private static final String SQL_DELETE_ENTRIES =
            "DROP TABLE IF EXISTS " + RouteData.FeedEntry.TABLE_NAME;


    private static final String SQL_CREATE_SETTINGS_ENTRIES =
            "CREATE TABLE " + SettingsTable.FeedEntry.TABLE_NAME + " (" +
                    SettingsTable.FeedEntry.is_android_GPS_used + " BOOL," +
                    SettingsTable.FeedEntry.is_android_orientation_used + " TEXT," +
                    SettingsTable.FeedEntry.distance_to_interpolated_point_max + " REAL," +
                    SettingsTable.FeedEntry.distance_to_anchor_point_threshold + " REAL," +
                    SettingsTable.FeedEntry.outboard_motor_pwm_min + " INT," +
                    SettingsTable.FeedEntry.servo_max_change + " INT," +
                    SettingsTable.FeedEntry.route_coordinate_update_radius + " REAL," +
                    SettingsTable.FeedEntry.hysteresis_normal_range + " REAL," +
                    SettingsTable.FeedEntry.hysteresis_strict_range + " REAL," +
                    SettingsTable.FeedEntry.kP + " REAL," +
                    SettingsTable.FeedEntry.kI + " REAL," +
                    SettingsTable.FeedEntry.kD + " REAL," +
                    SettingsTable.FeedEntry.dT + " REAL," +
                    SettingsTable.FeedEntry.use_OpenSeaMap + " TEXT);";


    private static final String SQL_INSERT_SETTINGS_ENTRIES =
            "INSERT INTO " + SettingsTable.FeedEntry.TABLE_NAME + " (" +
                    SettingsTable.FeedEntry.is_android_GPS_used + ", " +
                    SettingsTable.FeedEntry.is_android_orientation_used + ", " +
                    SettingsTable.FeedEntry.distance_to_interpolated_point_max + ", " +
                    SettingsTable.FeedEntry.distance_to_anchor_point_threshold + ", " +
                    SettingsTable.FeedEntry.outboard_motor_pwm_min + ", " +
                    SettingsTable.FeedEntry.servo_max_change + ", " +
                    SettingsTable.FeedEntry.route_coordinate_update_radius + ", " +
                    SettingsTable.FeedEntry.hysteresis_normal_range + ", " +
                    SettingsTable.FeedEntry.hysteresis_strict_range + ", " +
                    SettingsTable.FeedEntry.kP + ", " +
                    SettingsTable.FeedEntry.kI + ", " +
                    SettingsTable.FeedEntry.kD + ", " +
                    SettingsTable.FeedEntry.dT + ", " +
                    SettingsTable.FeedEntry.use_OpenSeaMap + ") " +
                    "VALUES ('true', 'true', 8.0, 3, 20, 180, 10.0, 4.0, 2.0, 0.7, 0, 0.01, 0.2, 0)";


    // Test table
    private static final String SQL_CREATE_TESTDATA_ENTRIES =
            "CREATE TABLE " + TestResultsTable.FeedEntry.TABLE_NAME + " (" +
                    TestResultsTable.FeedEntry.ID + " INTEGER PRIMARY KEY AUTOINCREMENT, " +
                    TestResultsTable.FeedEntry.COLUMN_SESSION_ID + " TEXT NOT NULL, " +
                    TestResultsTable.FeedEntry.COLUMN_DATA + " TEXT NOT NULL, " +
                    TestResultsTable.FeedEntry.ORIENTATION + " TEXT, " +
                    TestResultsTable.FeedEntry.ASSOCIATED_WITH + " TEXT, " +
                    TestResultsTable.FeedEntry.COLUMN_TIMESTAMP + " DATETIME DEFAULT CURRENT_TIMESTAMP);";

    private static final String SQL_DELETE_ANOTHER_ENTRIES =
            "DROP TABLE IF EXISTS " + SettingsTable.FeedEntry.TABLE_NAME;



    public FeedReaderDbHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    public void onCreate(SQLiteDatabase db) {
        db.execSQL(SQL_CREATE_ENTRIES);
        db.execSQL(SQL_CREATE_SETTINGS_ENTRIES);
        db.execSQL(SQL_INSERT_SETTINGS_ENTRIES);
        db.execSQL(SQL_CREATE_TESTDATA_ENTRIES);


    }

    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // This database is only a cache for online data, so its upgrade policy is
        // to simply to discard the data and start over
        db.execSQL(SQL_DELETE_ENTRIES);
        db.execSQL(SQL_DELETE_ANOTHER_ENTRIES);

        onCreate(db);
    }

    public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        onUpgrade(db, oldVersion, newVersion);
    }
}