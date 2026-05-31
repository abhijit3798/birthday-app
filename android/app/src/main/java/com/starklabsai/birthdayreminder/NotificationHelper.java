package com.starklabsai.birthdayreminder;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.provider.Settings;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.starklabsai.birthdayreminder.R;

public class NotificationHelper {

    public static final String CHANNEL_ID = "birthday_reminders_channel";
    public static final String CHANNEL_NAME = "Birthday Reminders";
    public static final String CHANNEL_DESC = "Notifications for upcoming birthday reminders";
    public static final String GROUP_KEY = "com.starklabsai.birthdayreminder.BIRTHDAY_NOTIFS";
    public static final int SUMMARY_ID = 9999;

    /**
     * Creates the Notification Channel if Android version is Oreo (8.0) or higher.
     */
    public static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    CHANNEL_NAME,
                    NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription(CHANNEL_DESC);
            channel.enableLights(true);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{100, 200, 300, 400, 500, 400, 300, 200, 400});

            NotificationManager manager = context.getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    /**
     * Shows a birthday notification in the Android tray.
     */
    public static void showNotification(Context context, String id, String name, int age, String birthDate, int daysBefore, boolean hideYear) {
        createNotificationChannel(context);

        int requestCode = Math.abs(id.hashCode());

        // Create launch intent targeting MainActivity
        Intent intent = new Intent(context, MainActivity.class);
        intent.putExtra("birthday_id", id);
        intent.setAction("ACTION_SHOW_BIRTHDAY_" + id); // Unique action prevents intent caching/colliding
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        PendingIntent pendingIntent = PendingIntent.getActivity(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Build Title and Message based on days before
        String title = "🎂 Birthday Reminder";
        String message = "";
        String subText = "";

        if (birthDate != null && !birthDate.isEmpty()) {
            subText = "Born: " + birthDate;
        }

        if (daysBefore == 0) {
            message = "Today is " + name + "'s birthday.";
            if (!hideYear && age > 0) {
                message += "\nTurns " + age + " today.";
            }
        } else if (daysBefore == 1) {
            message = "Reminder:\n" + name + "'s birthday is tomorrow.";
        } else {
            message = "Reminder:\n" + name + "'s birthday is in " + daysBefore + " days.";
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification) // Dedicated monochrome white silhouette icon (Issue 3)
                .setContentTitle(title)
                .setContentText(message.replace("\n", " ")) // Inline preview
                .setStyle(new NotificationCompat.BigTextStyle().bigText(message))
                .setSubText(subText)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_REMINDER)
                .setAutoCancel(true)
                .setContentIntent(pendingIntent)
                .setGroup(GROUP_KEY);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);

        // Post the individual notification
        try {
            notificationManager.notify(requestCode, builder.build());

            // Post/Update Group Summary Notification
            NotificationCompat.Builder summaryBuilder = new NotificationCompat.Builder(context, CHANNEL_ID)
                    .setSmallIcon(R.drawable.ic_notification) // Dedicated monochrome white silhouette icon
                    .setContentTitle("🎂 Birthday Reminders")
                    .setContentText("You have upcoming birthdays")
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setGroup(GROUP_KEY)
                    .setGroupSummary(true)
                    .setAutoCancel(true);

            notificationManager.notify(SUMMARY_ID, summaryBuilder.build());
        } catch (SecurityException e) {
            // Permission missing (Android 13+)
            e.printStackTrace();
        }
    }

    /**
     * Checks if notification permission is granted.
     */
    public static boolean isNotificationPermissionGranted(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return NotificationManagerCompat.from(context).areNotificationsEnabled();
        }
        return true;
    }

    /**
     * Checks if exact alarm scheduling is allowed.
     */
    public static boolean isExactAlarmAllowed(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager manager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            return manager == null || manager.canScheduleExactAlarms();
        }
        return true;
    }

    /**
     * Checks if the app is ignored by Battery Optimizations.
     */
    public static boolean isBatteryOptimizationIgnored(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            return pm == null || pm.isIgnoringBatteryOptimizations(context.getPackageName());
        }
        return true;
    }

    /**
     * Directs the user to Request Ignoring Battery Optimizations.
     */
    public static void requestIgnoreBatteryOptimizations(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            try {
                Intent intent = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                intent.setData(Uri.parse("package:" + context.getPackageName()));
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            } catch (Exception e) {
                Intent intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                context.startActivity(intent);
            }
        }
    }

    /**
     * Directs the user to Exact Alarm system settings.
     */
    public static void requestExactAlarmPermission(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
            intent.setData(Uri.parse("package:" + context.getPackageName()));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
        }
    }
}
