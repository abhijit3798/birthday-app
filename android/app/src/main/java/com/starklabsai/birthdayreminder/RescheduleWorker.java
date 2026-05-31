package com.starklabsai.birthdayreminder;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.work.Worker;
import androidx.work.WorkerParameters;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Calendar;
import java.util.HashSet;
import java.util.Set;

public class RescheduleWorker extends Worker {

    private static final String TAG = "RescheduleWorker";

    public RescheduleWorker(@NonNull Context context, @NonNull WorkerParameters workerParams) {
        super(context, workerParams);
    }

    @NonNull
    @Override
    public Result doWork() {
        Log.d(TAG, "Executing alarm rescheduling worker background task...");
        try {
            rescheduleAllAlarms(getApplicationContext());
            return Result.success();
        } catch (Exception e) {
            Log.e(TAG, "Error in alarm rescheduling: ", e);
            return Result.failure();
        }
    }

    /**
     * Core rescheduling routine. Can be called from the plugin directly or from background work.
     */
    public static void rescheduleAllAlarms(Context context) {
        SharedPreferences prefs = context.getSharedPreferences("BirthdayReminderPrefs", Context.MODE_PRIVATE);
        String birthdaysJson = prefs.getString("birthdays_json", "[]");
        String globalSettingsJson = prefs.getString("global_settings_json", "{}");

        Log.d(TAG, "Rescheduling alarms with raw birthdays: " + birthdaysJson + " and globalSettings: " + globalSettingsJson);

        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            Log.e(TAG, "AlarmManager not available.");
            return;
        }

        // 1. Cancel previously scheduled alarms to prevent stale triggers and duplicates
        Set<String> previouslyScheduled = prefs.getStringSet("scheduled_ids", new HashSet<>());
        for (String id : previouslyScheduled) {
            cancelAlarm(context, alarmManager, id);
        }

        // 2. Parse global settings
        JSONObject globalSettings;
        boolean globalEnabled = true;
        int globalDaysBefore = 1;
        String globalTime = "09:00";
        int globalLeapYearDaysBefore = 1;

        try {
            globalSettings = new JSONObject(globalSettingsJson);
            globalEnabled = globalSettings.optBoolean("enabled", true);
            globalDaysBefore = globalSettings.optInt("daysBefore", 1);
            globalTime = globalSettings.optString("notificationTime", "09:00");
            globalLeapYearDaysBefore = globalSettings.optInt("leapYearDaysBefore", 1);
        } catch (Exception e) {
            Log.e(TAG, "Error parsing global settings", e);
        }

        // 3. Process new list and schedule future alarms
        JSONArray birthdaysArray;
        Set<String> newlyScheduled = new HashSet<>();

        try {
            birthdaysArray = new JSONArray(birthdaysJson);
            Calendar now = Calendar.getInstance();

            for (int i = 0; i < birthdaysArray.length(); i++) {
                JSONObject contact = birthdaysArray.getJSONObject(i);
                if (contact == null) continue;

                String id = contact.optString("id");
                String name = contact.optString("name");
                String dateStr = contact.optString("date");

                if (id == null || id.isEmpty() || name == null || name.isEmpty() || dateStr == null || dateStr.isEmpty()) {
                    continue;
                }

                // Check custom reminders priority
                boolean shouldSchedule = false;
                int daysBefore = globalDaysBefore;
                int leapYearDaysBefore = globalLeapYearDaysBefore;
                String timeStr = globalTime;

                JSONObject custom = contact.optJSONObject("customReminders");
                if (custom != null) {
                    if (custom.has("enabled")) {
                        boolean customEnabled = custom.getBoolean("enabled");
                        if (customEnabled) {
                            shouldSchedule = true;
                            daysBefore = custom.optInt("daysBefore", 1);
                            leapYearDaysBefore = custom.optInt("leapYearDaysBefore", daysBefore);
                            timeStr = custom.optString("notificationTime", "09:00");
                        } else {
                            // Case 3: Custom disabled. Do not schedule reminder.
                            shouldSchedule = false;
                        }
                    } else {
                        // Custom settings block exists but no enabled field. Fallback to global.
                        shouldSchedule = globalEnabled;
                    }
                } else {
                    // No custom configured. Fallback to global.
                    shouldSchedule = globalEnabled;
                }

                if (!shouldSchedule) {
                    Log.d(TAG, "Skipping reminder for " + name + " (reminders disabled for this birthday)");
                    continue;
                }

                boolean hideYear = contact.optBoolean("hideYear", false);

                // Compute exact future trigger time
                Calendar triggerTime = calculateTriggerTime(dateStr, daysBefore, leapYearDaysBefore, timeStr, now);
                if (triggerTime == null) {
                    continue;
                }

                // Calculate the age turning this year
                int age = -1;
                try {
                    String[] parts = dateStr.split("-");
                    int birthYear = Integer.parseInt(parts[0]);
                    int upcomingYear = triggerTime.get(Calendar.YEAR);
                    // Add back the daysBefore difference to get the birthday year
                    Calendar bdayDate = (Calendar) triggerTime.clone();
                    bdayDate.add(Calendar.DAY_OF_MONTH, daysBefore);
                    upcomingYear = bdayDate.get(Calendar.YEAR);
                    age = upcomingYear - birthYear;
                } catch (Exception ignored) {}

                // Schedule alarm via PendingIntent
                Intent intent = new Intent(context, AlarmReceiver.class);
                intent.setAction("com.starklabsai.birthdayreminder.ACTION_ALARM_" + id);
                intent.putExtra("id", id);
                intent.putExtra("name", name);
                intent.putExtra("age", age);
                intent.putExtra("birthDate", dateStr);
                intent.putExtra("daysBefore", daysBefore);
                intent.putExtra("hideYear", hideYear);

                int requestCode = Math.abs(id.hashCode());
                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                        context,
                        requestCode,
                        intent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && !alarmManager.canScheduleExactAlarms()) {
                        // Non-exact fallback to prevent crashes if permission is missing
                        alarmManager.set(AlarmManager.RTC_WAKEUP, triggerTime.getTimeInMillis(), pendingIntent);
                    } else {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                            alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime.getTimeInMillis(), pendingIntent);
                        } else {
                            alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerTime.getTimeInMillis(), pendingIntent);
                        }
                    }
                    newlyScheduled.add(id);
                    Log.d(TAG, "Scheduled alarm for " + name + " (ID: " + id + ") at: " + triggerTime.getTime().toString() + " (Age: " + age + ")");
                } catch (SecurityException se) {
                    Log.w(TAG, "SecurityException scheduling exact alarm. Falling back to non-exact scheduling.", se);
                    alarmManager.set(AlarmManager.RTC_WAKEUP, triggerTime.getTimeInMillis(), pendingIntent);
                    newlyScheduled.add(id);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error during bulk alarm scheduling: ", e);
        }

        // 4. Update scheduled IDs in SharedPreferences
        prefs.edit().putStringSet("scheduled_ids", newlyScheduled).apply();
    }

    /**
     * Cancels an alarm for the given birthday ID.
     */
    private static void cancelAlarm(Context context, AlarmManager alarmManager, String id) {
        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.setAction("com.starklabsai.birthdayreminder.ACTION_ALARM_" + id);
        int requestCode = Math.abs(id.hashCode());

        PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
        );

        if (pendingIntent != null) {
            alarmManager.cancel(pendingIntent);
            pendingIntent.cancel();
            Log.d(TAG, "Cancelled existing alarm for ID: " + id);
        }
    }

    /**
     * Calculates the next future trigger time for a given birthday record.
     */
    public static Calendar calculateTriggerTime(String dateStr, int daysBefore, int leapYearDaysBefore, String notificationTime, Calendar now) {
        try {
            String[] parts = dateStr.split("-");
            int birthYear = Integer.parseInt(parts[0]);
            int birthMonth = Integer.parseInt(parts[1]) - 1;
            int birthDay = Integer.parseInt(parts[2]);

            String[] timeParts = (notificationTime != null ? notificationTime : "09:00").split(":");
            int hour = Integer.parseInt(timeParts[0]);
            int minute = Integer.parseInt(timeParts[1]);

            // 1. Get the trigger date for this year
            Calendar triggerDate = getReminderTriggerDate(birthYear, birthMonth, birthDay, daysBefore, leapYearDaysBefore, now);
            triggerDate.set(Calendar.HOUR_OF_DAY, hour);
            triggerDate.set(Calendar.MINUTE, minute);
            triggerDate.set(Calendar.SECOND, 0);
            triggerDate.set(Calendar.MILLISECOND, 0);

            // 2. If it is in the past, calculate for next year's occurrence
            if (triggerDate.before(now)) {
                Calendar nextYearRef = Calendar.getInstance();
                nextYearRef.setTimeInMillis(now.getTimeInMillis());
                nextYearRef.add(Calendar.YEAR, 1);

                triggerDate = getReminderTriggerDate(birthYear, birthMonth, birthDay, daysBefore, leapYearDaysBefore, nextYearRef);
                triggerDate.set(Calendar.HOUR_OF_DAY, hour);
                triggerDate.set(Calendar.MINUTE, minute);
                triggerDate.set(Calendar.SECOND, 0);
                triggerDate.set(Calendar.MILLISECOND, 0);
            }

            return triggerDate;
        } catch (Exception e) {
            Log.e(TAG, "Error calculating trigger time for " + dateStr, e);
            return null;
        }
    }

    public static Calendar getReminderTriggerDate(int birthYear, int birthMonth, int birthDay, int daysBefore, int leapYearDaysBefore, Calendar today) {
        Calendar nextBday = getNextBirthday(birthYear, birthMonth, birthDay, today);
        int targetYear = nextBday.get(Calendar.YEAR);
        boolean isLeapYear = (targetYear % 4 == 0 && targetYear % 100 != 0) || (targetYear % 400 == 0);

        int activeDaysBefore = daysBefore;
        Calendar baseDate = (Calendar) nextBday.clone();

        boolean isFeb29 = birthMonth == Calendar.FEBRUARY && birthDay == 29;
        if (isFeb29 && !isLeapYear) {
            activeDaysBefore = leapYearDaysBefore;
            baseDate.set(Calendar.MONTH, Calendar.FEBRUARY);
            baseDate.set(Calendar.DAY_OF_MONTH, 28);
        }

        Calendar triggerDate = (Calendar) baseDate.clone();
        triggerDate.add(Calendar.DAY_OF_MONTH, -activeDaysBefore);
        return triggerDate;
    }

    public static Calendar getNextBirthday(int birthYear, int birthMonth, int birthDay, Calendar today) {
        int currentYear = today.get(Calendar.YEAR);
        Calendar nextBday = Calendar.getInstance();
        nextBday.set(Calendar.YEAR, currentYear);
        nextBday.set(Calendar.MONTH, birthMonth);
        nextBday.set(Calendar.DAY_OF_MONTH, birthDay);
        nextBday.set(Calendar.HOUR_OF_DAY, 0);
        nextBday.set(Calendar.MINUTE, 0);
        nextBday.set(Calendar.SECOND, 0);
        nextBday.set(Calendar.MILLISECOND, 0);

        // Handle Feb 29 leap year rollover
        if (birthMonth == Calendar.FEBRUARY && birthDay == 29) {
            if (nextBday.get(Calendar.MONTH) != Calendar.FEBRUARY) {
                // Non-leap year; celebrate on Feb 28
                nextBday.set(Calendar.MONTH, Calendar.FEBRUARY);
                nextBday.set(Calendar.DAY_OF_MONTH, 28);
            }
        }

        // Comparison needs to be done on dates only
        Calendar todayStart = Calendar.getInstance();
        todayStart.setTimeInMillis(today.getTimeInMillis());
        todayStart.set(Calendar.HOUR_OF_DAY, 0);
        todayStart.set(Calendar.MINUTE, 0);
        todayStart.set(Calendar.SECOND, 0);
        todayStart.set(Calendar.MILLISECOND, 0);

        if (nextBday.before(todayStart)) {
            int nextYear = currentYear + 1;
            nextBday.set(Calendar.YEAR, nextYear);
            nextBday.set(Calendar.MONTH, birthMonth);
            nextBday.set(Calendar.DAY_OF_MONTH, birthDay);

            if (birthMonth == Calendar.FEBRUARY && birthDay == 29) {
                if (nextBday.get(Calendar.MONTH) != Calendar.FEBRUARY) {
                    nextBday.set(Calendar.MONTH, Calendar.FEBRUARY);
                    nextBday.set(Calendar.DAY_OF_MONTH, 28);
                }
            }
        }

        return nextBday;
    }
}
