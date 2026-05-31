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
            // Trigger tray notification display
            NotificationHelper.showNotification(context, id, name, age, birthDate, daysBefore, hideYear);
        }
    }
}
