package com.my.VeneilyApp.data;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

public class DataAccessObject {

    private FeedReaderDbHelper dbHelper;

    public DataAccessObject(Context context) {
        dbHelper = new FeedReaderDbHelper(context);
    }

    public void insertData(String title, String coordinateString, String routeType) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        values.put(FeedReaderContract.FeedEntry.COLUMN_NAME_TITLE, title);
        values.put(FeedReaderContract.FeedEntry.COLUMN_NAME_COORDINATESTRING, coordinateString);
        values.put(FeedReaderContract.FeedEntry.COLUMN_NAME_TYPE, routeType);
        db.insert(FeedReaderContract.FeedEntry.TABLE_NAME, null, values);
    }

    public String getData(int id, String columnName) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        // Define the columns you want to retrieve
        String[] projection = new String[]{columnName};

        // Define the WHERE clause
        String selection = FeedReaderContract.FeedEntry._ID + " = ?";
        String[] selectionArgs = {String.valueOf(id)};

        // Perform the query
        Cursor cursor = db.query(
                FeedReaderContract.FeedEntry.TABLE_NAME,  // The table to query
                projection,                               // The columns to retrieve
                selection,                                // The WHERE clause
                selectionArgs,                            // The values for the WHERE clause
                null,                                     // Don't group the rows
                null,                                     // Don't filter by row groups
                null                                      // No sort order
        );

        // Build the result string
        StringBuilder result = new StringBuilder();

        // Check if the cursor has a valid row
        if (cursor.moveToFirst()) {
            String columnValue = cursor.getString(cursor.getColumnIndexOrThrow(columnName));
            result.append(columnValue).append("");
        }

        // Close the cursor
        cursor.close();

        // Return the result string
        return result.toString();
    }

    public String getData(int id, boolean onlyLastColumn) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        // Define the columns you want to retrieve
        String[] projection;
        if (onlyLastColumn) {
            projection = new String[]{
                    FeedReaderContract.FeedEntry.COLUMN_NAME_TYPE
            };
        } else {
            projection = new String[]{
                    FeedReaderContract.FeedEntry._ID,
                    FeedReaderContract.FeedEntry.COLUMN_NAME_TITLE,
                    FeedReaderContract.FeedEntry.COLUMN_NAME_COORDINATESTRING
            };
        }

        // Define the WHERE clause
        String selection = FeedReaderContract.FeedEntry._ID + " = ?";
        String[] selectionArgs = {String.valueOf(id)};

        // Perform the query
        Cursor cursor = db.query(
                FeedReaderContract.FeedEntry.TABLE_NAME,  // The table to query
                projection,                               // The columns to retrieve
                selection,                                // The WHERE clause
                selectionArgs,                            // The values for the WHERE clause
                null,                                     // Don't group the rows
                null,                                     // Don't filter by row groups
                null                                      // No sort order
        );

        // Build the result string
        StringBuilder result = new StringBuilder();
        if (cursor.moveToNext()) {
            if (onlyLastColumn) {
                String routeType = cursor.getString(
                        cursor.getColumnIndexOrThrow(FeedReaderContract.FeedEntry.COLUMN_NAME_TYPE));
                result.append(routeType).append("\n");
            } else {
                long itemId = cursor.getLong(
                        cursor.getColumnIndexOrThrow(FeedReaderContract.FeedEntry._ID));
                String title = cursor.getString(
                        cursor.getColumnIndexOrThrow(FeedReaderContract.FeedEntry.COLUMN_NAME_TITLE));
                String coordinateString = cursor.getString(
                        cursor.getColumnIndexOrThrow(FeedReaderContract.FeedEntry.COLUMN_NAME_COORDINATESTRING));

                result.append(itemId).append(": ").append(title).append(" - ").append(coordinateString).append("\n");
            }
        }

        // Close the cursor
        cursor.close();

        // Return the result string
        return result.toString();
    }


    public void deleteRow(long id) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        String whereClause = FeedReaderContract.FeedEntry._ID + " = ?";
        String[] whereArgs = { Long.toString(id) };
        int rowsDeleted = db.delete(FeedReaderContract.FeedEntry.TABLE_NAME, whereClause, whereArgs);

        if (rowsDeleted > 0) {
            Log.d("OMA DEBUGGAUS_1", "Row deleted with ID = " + id);
            // Update the IDs of all rows that have an ID greater than the deleted row's ID
            String updateQuery = "UPDATE " + FeedReaderContract.FeedEntry.TABLE_NAME +
                    " SET " + FeedReaderContract.FeedEntry._ID + " = " + FeedReaderContract.FeedEntry._ID + " - 1" +
                    " WHERE " + FeedReaderContract.FeedEntry._ID + " > " + String.valueOf(id);
            db.execSQL(updateQuery);
        } else {
            Log.d("OMA DEBUGGAUS_1", "No rows deleted with ID = " + id);
        }

        db.close();
    }


}

