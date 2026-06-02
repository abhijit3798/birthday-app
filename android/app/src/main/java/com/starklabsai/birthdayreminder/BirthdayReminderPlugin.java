package com.starklabsai.birthdayreminder;

import android.content.Context;
import android.util.Log;
import android.content.SharedPreferences;
import android.os.Build;
import androidx.core.app.ActivityCompat;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.Set;
import java.util.HashSet;


@CapacitorPlugin(name = "BirthdayReminder")
public class BirthdayReminderPlugin extends Plugin {

    @PluginMethod
    public void scheduleReminders(PluginCall call) {
        JSArray birthdays = call.getArray("birthdays");
        JSObject globalSettings = call.getObject("globalSettings");
        Log.d("BirthdayReminder", "scheduleReminders called");
        Log.d("BirthdayReminder", "Birthdays = " + birthdays);
        Log.d("BirthdayReminder", "Global Settings = " + globalSettings);

        if (birthdays == null || globalSettings == null) {
            call.reject("Missing required parameters: birthdays or globalSettings");
            return;
        }

        try {
            // Save state to SharedPreferences for background BootReceiver and RescheduleWorker
            SharedPreferences prefs = getContext().getSharedPreferences("BirthdayReminderPrefs", Context.MODE_PRIVATE);
            prefs.edit()
                    .putString("birthdays_json", birthdays.toString())
                    .putString("global_settings_json", globalSettings.toString())
                    .apply();

            // Run rescheduling immediately on background thread
            RescheduleWorker.rescheduleAllAlarms(getContext());

            JSObject result = new JSObject();
            result.put("success", true);
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Error scheduling alarms: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void isNotificationPermissionGranted(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("value", NotificationHelper.isNotificationPermissionGranted(getContext()));
        call.resolve(ret);
    }

    @PluginMethod
    public void requestNotificationPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (getActivity().checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) != android.content.pm.PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(
                        getActivity(),
                        new String[]{android.Manifest.permission.POST_NOTIFICATIONS},
                        101
                );
            }
        }
        JSObject ret = new JSObject();
        ret.put("granted", NotificationHelper.isNotificationPermissionGranted(getContext()));
        call.resolve(ret);
    }

    @PluginMethod
    public void isExactAlarmAllowed(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("value", NotificationHelper.isExactAlarmAllowed(getContext()));
        call.resolve(ret);
    }

    @PluginMethod
    public void requestExactAlarmPermission(PluginCall call) {
        NotificationHelper.requestExactAlarmPermission(getContext());
        call.resolve();
    }

    @PluginMethod
    public void isBatteryOptimizationIgnored(PluginCall call) {
        JSObject ret = new JSObject();
        ret.put("value", NotificationHelper.isBatteryOptimizationIgnored(getContext()));
        call.resolve(ret);
    }

    @PluginMethod
    public void requestIgnoreBatteryOptimizations(PluginCall call) {
        NotificationHelper.requestIgnoreBatteryOptimizations(getContext());
        call.resolve();
    }

    @PluginMethod
    public void getLaunchBirthdayId(PluginCall call) {
        String birthdayId = MainActivity.getAndClearLaunchBirthdayId();
        JSObject ret = new JSObject();
        ret.put("birthdayId", birthdayId != null ? birthdayId : "");
        call.resolve(ret);
    }

    @PluginMethod
    public void getAndClearDeliveredNotifications(PluginCall call) {
        try {
            SharedPreferences prefs = getContext().getSharedPreferences("BirthdayReminderPrefs", Context.MODE_PRIVATE);
            Set<String> delivered = prefs.getStringSet("delivered_keys", new HashSet<String>());
            
            JSArray arr = new JSArray();
            for (String key : delivered) {
                arr.put(key);
            }
            
            // Clear the delivered set from native storage to keep it optimal
            prefs.edit().remove("delivered_keys").apply();
            
            JSObject ret = new JSObject();
            ret.put("delivered", arr);
            call.resolve(ret);
        } catch (Exception e) {
            call.reject("Failed to get and clear delivered notifications: " + e.getMessage(), e);
        }
    }

    @PluginMethod
    public void openSettings(PluginCall call) {
        try {
            android.content.Intent intent = new android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            android.net.Uri uri = android.net.Uri.fromParts("package", getContext().getPackageName(), null);
            intent.setData(uri);
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception e) {
            call.reject("Failed to open settings: " + e.getMessage(), e);
        }
    }
}
