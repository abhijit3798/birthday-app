import { registerPlugin, Capacitor } from '@capacitor/core';

// Register our custom native Android plugin
const BirthdayReminder = registerPlugin('BirthdayReminder');

const isAndroid = () => Capacitor.getPlatform() === 'android';

/**
 * Synchronizes the list of birthdays and global reminder settings with the Android native AlarmManager.
 * 
 * @param {Array} birthdays - List of birthday items
 * @param {Object} globalSettings - Global settings from localStorage
 */
export async function syncWithNative(birthdays, globalSettings) {
  if (!isAndroid()) {
    console.log('⏰ Native Sync - Bypassed (Not running on Android)');
    return false;
  }

  try {
    const formattedBirthdays = birthdays.map(b => ({
      id: b.id,
      name: b.name,
      date: b.date,
      hideYear: !!b.hideYear,
      customReminders: b.customReminders || null
    }));

    const formattedSettings = {
      enabled: !!globalSettings.enabled,
      daysBefore: Number(globalSettings.daysBefore) ?? 1,
      notificationTime: globalSettings.notificationTime || '09:00',
      leapYearDaysBefore: Number(globalSettings.leapYearDaysBefore) ?? 1
    };

    console.log('⏰ Native Sync - Launching sync with', formattedBirthdays.length, 'birthdays');
    const result = await BirthdayReminder.scheduleReminders({
      birthdays: formattedBirthdays,
      globalSettings: formattedSettings
    });

    console.log('⏰ Native Sync - Alarm scheduling successful:', result);
    return true;
  } catch (error) {
    console.error('⏰ Native Sync - Failed to sync with native layer:', error);
    return false;
  }
}

/**
 * Checks and returns permission diagnostics for Notifications, Exact Alarms, and Battery Optimizations.
 */
export async function getNativeDiagnostics() {
  if (!isAndroid()) {
    return {
      notifications: true,
      exactAlarms: true,
      batteryOptimization: true,
      isNative: false
    };
  }

  try {
    const notifGranted = await BirthdayReminder.isNotificationPermissionGranted();
    const alarmGranted = await BirthdayReminder.isExactAlarmAllowed();
    const batteryIgnored = await BirthdayReminder.isBatteryOptimizationIgnored();

    return {
      notifications: !!notifGranted.value,
      exactAlarms: !!alarmGranted.value,
      batteryOptimization: !!batteryIgnored.value,
      isNative: true
    };
  } catch (e) {
    console.error('Failed to get native diagnostics:', e);
    return {
      notifications: false,
      exactAlarms: false,
      batteryOptimization: false,
      isNative: true
    };
  }
}

/**
 * Requests Notification permission.
 */
export async function requestNativeNotificationPermission() {
  if (!isAndroid()) return true;
  try {
    const result = await BirthdayReminder.requestNotificationPermission();
    return !!result.granted;
  } catch (e) {
    console.error('Error requesting notifications:', e);
    return false;
  }
}

/**
 * Navigates the user to system settings to allow Exact Alarms.
 */
export async function requestNativeExactAlarmPermission() {
  if (!isAndroid()) return;
  try {
    await BirthdayReminder.requestExactAlarmPermission();
  } catch (e) {
    console.error('Error requesting exact alarm permission:', e);
  }
}

/**
 * Navigates the user to system settings to bypass Battery Optimization.
 */
export async function requestNativeBatteryBypass() {
  if (!isAndroid()) return;
  try {
    await BirthdayReminder.requestIgnoreBatteryOptimizations();
  } catch (e) {
    console.error('Error requesting battery bypass:', e);
  }
}

/**
 * Checks if the application was launched by tapping a birthday notification.
 * If yes, it executes the callback with the targeted birthday ID.
 * 
 * @param {Function} callback - Callback taking (birthdayId)
 */
export async function checkLaunchNotification(callback) {
  if (!isAndroid()) return;
  try {
    const result = await BirthdayReminder.getLaunchBirthdayId();
    if (result && result.birthdayId) {
      console.log('🚀 App launched via Notification Tap for birthday ID:', result.birthdayId);
      callback(result.birthdayId);
    }
  } catch (e) {
    console.error('Failed checking launch notification payload:', e);
  }
}
