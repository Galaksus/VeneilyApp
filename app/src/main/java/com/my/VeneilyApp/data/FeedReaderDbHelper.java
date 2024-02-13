package com.my.VeneilyApp.data;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;


public class FeedReaderDbHelper extends SQLiteOpenHelper {
    private static final int DATABASE_VERSION = 1;
    private static final String DATABASE_NAME = "FeedReader.db";

    private static final String SQL_CREATE_ENTRIES =
            "CREATE TABLE " + FeedReaderContract.FeedEntry.TABLE_NAME + " (" +
                    FeedReaderContract.FeedEntry._ID + " INTEGER PRIMARY KEY," +
                    FeedReaderContract.FeedEntry.COLUMN_NAME_TITLE + " TEXT," +
                    FeedReaderContract.FeedEntry.COLUMN_NAME_COORDINATESTRING + " TEXT," +
                    FeedReaderContract.FeedEntry.COLUMN_NAME_TYPE + " TEXT)";

    private static final String SQL_DELETE_ENTRIES =
            "DROP TABLE IF EXISTS " + FeedReaderContract.FeedEntry.TABLE_NAME;


    private static final String SQL_CREATE_ANOTHER_ENTRIES =
            "CREATE TABLE " + SettingsTable.FeedEntry.TABLE_NAME + " (" +
                    SettingsTable.FeedEntry.COLUMN_NAME_1 + " TEXT," +
                    SettingsTable.FeedEntry.COLUMN_NAME_2 + " TEXT)";

    private static final String SQL_INSERT_ANOTHER_ENTRIES =
            "INSERT INTO " + SettingsTable.FeedEntry.TABLE_NAME + " (" +
                    SettingsTable.FeedEntry.COLUMN_NAME_1 + ", " +
                    SettingsTable.FeedEntry.COLUMN_NAME_2 + ") " +
                    "VALUES (0, 1)";

    private static final String SQL_DELETE_ANOTHER_ENTRIES =
            "DROP TABLE IF EXISTS " + SettingsTable.FeedEntry.TABLE_NAME;



    public FeedReaderDbHelper(Context context) {
        super(context, DATABASE_NAME, null, DATABASE_VERSION);
    }

    public void onCreate(SQLiteDatabase db) {
        db.execSQL(SQL_CREATE_ENTRIES);
        db.execSQL(SQL_CREATE_ANOTHER_ENTRIES);
        db.execSQL(SQL_INSERT_ANOTHER_ENTRIES);

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