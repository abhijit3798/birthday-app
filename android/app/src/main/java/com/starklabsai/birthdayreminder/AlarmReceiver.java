package com.starklabsai.birthdayreminder;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class AlarmReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String id = intent.getStringExtra("id");
        String name = intent.getStringExtra("name");
        int age = intent.getIntExtra("age", -1);
        String birthDate = intent.getStringExtra("birthDate");
        int daysBefore = intent.getIntExtra("daysBefore", 1);
        boolean hideYear = intent.getBooleanExtra("hideYear", false);

        if (id != null && name != null) {
            // Mark the notification uniqueKey as persistently delivered (Issue 1 & 2)
            String uniqueKey = intent.getStringExtra("uniqueKey");
            if (uniqueKey != null) {
                android.content.SharedPreferences prefs = context.getSharedPreferences("BirthdayReminderPrefs", Context.MODE_PRIVATE);
                java.util.Set<String> delivered = prefs.getStringSet("delivered_keys", new java.util.HashSet<String>());
                java.util.Set<String> newDelivered = new java.util.HashSet<String>(delivered);
                newDelivered.add(uniqueKey);
                prefs.edit().putStringSet("delivered_keys", newDelivered).apply();
            }

            // Trigger tray notification display
            NotificationHelper.showNotification(context, id, name, age, birthDate, daysBefore, hideYear);
        }
    }
}
