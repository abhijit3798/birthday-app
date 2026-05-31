package com.starklabsai.birthdayreminder;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.work.OneTimeWorkRequest;
import androidx.work.WorkManager;

public class BootReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String action = intent.getAction();
        if (Intent.ACTION_BOOT_COMPLETED.equals(action)
                || Intent.ACTION_MY_PACKAGE_REPLACED.equals(action)
                || "android.intent.action.QUICKBOOT_POWERON".equals(action)) {

            // Offload exact alarm rescheduling work to WorkManager
            try {
                OneTimeWorkRequest rescheduleRequest = new OneTimeWorkRequest.Builder(RescheduleWorker.class).build();
                WorkManager.getInstance(context.getApplicationContext()).enqueue(rescheduleRequest);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
