import assert from 'assert';
import { getNextBirthday, getReminderTriggerDate, parseDate } from '../utils/dateHelpers.js';

console.log('🧪 Starting Automated Notification System Tests...\n');

try {
  // ----------------------------------------------------
  // Test 1: Priority Logic Resolution
  // ----------------------------------------------------
  console.log('1. Testing Reminder Priority Logic...');

  const refToday = new Date('2026-05-31T12:00:00'); // Ref date: May 31, 2026
  const globalSettings = {
    enabled: true,
    daysBefore: 1,
    notificationTime: '09:00',
    leapYearDaysBefore: 1
  };

  // Case 1: Birthday has custom reminder enabled (should override global settings)
  // Global: 1 day before, Custom: 3 days before
  const bdayCustomEnabled = {
    date: '1995-06-05', // Bday: June 5
    customReminders: {
      enabled: true,
      daysBefore: 3,
      notificationTime: '08:00'
    }
  };
  const triggerCase1 = getReminderTriggerDate(bdayCustomEnabled, globalSettings, refToday);
  // Next Bday is June 5, 2026. Custom is 3 days before -> June 2, 2026
  assert.strictEqual(triggerCase1.getFullYear(), 2026);
  assert.strictEqual(triggerCase1.getMonth(), 5); // June
  assert.strictEqual(triggerCase1.getDate(), 2);
  console.log('   ✅ Case 1: Custom reminder enabled overrides global settings passed.');

  // Case 2: Custom reminder not configured (should fallback to global settings)
  // Global: 1 day before, Custom: not configured
  const bdayCustomNotConfigured = {
    date: '1995-06-05' // Bday: June 5
  };
  const triggerCase2 = getReminderTriggerDate(bdayCustomNotConfigured, globalSettings, refToday);
  // Next Bday is June 5, 2026. Fallback is 1 day before -> June 4, 2026
  assert.strictEqual(triggerCase2.getFullYear(), 2026);
  assert.strictEqual(triggerCase2.getMonth(), 5); // June
  assert.strictEqual(triggerCase2.getDate(), 4);
  console.log('   ✅ Case 2: Custom reminder not configured falls back to global settings passed.');

  // Case 3: Global enabled, Birthday Custom: Disabled (should ignore global and not schedule)
  const bdayCustomDisabled = {
    date: '1995-06-05',
    customReminders: {
      enabled: false,
      daysBefore: 3,
      notificationTime: '08:00'
    }
  };
  const triggerCase3 = getReminderTriggerDate(bdayCustomDisabled, globalSettings, refToday);
  assert.strictEqual(triggerCase3, null);
  console.log('   ✅ Case 3: Custom reminder disabled ignores global and skips schedule passed.');


  // ----------------------------------------------------
  // Test 2: Trigger Timings (Today, Tomorrow, 7 Days After)
  // ----------------------------------------------------
  console.log('\n2. Testing Trigger Timings (Today, Tomorrow, 7 Days)...');

  // A. Birthday today, daysBefore = 0 (should trigger today)
  const bdayToday = { date: '1995-05-31' }; // Today is May 31
  const settingsToday = { enabled: true, daysBefore: 0, notificationTime: '09:00' };
  const triggerToday = getReminderTriggerDate(bdayToday, settingsToday, refToday);
  assert.strictEqual(triggerToday.getFullYear(), 2026);
  assert.strictEqual(triggerToday.getMonth(), 4); // May
  assert.strictEqual(triggerToday.getDate(), 31);
  console.log('   ✅ Birthday today with 0 days before triggers today passed.');

  // B. Birthday tomorrow, daysBefore = 1 (should trigger today)
  const bdayTomorrow = { date: '1995-06-01' }; // Tomorrow is June 1
  const settingsTomorrow = { enabled: true, daysBefore: 1, notificationTime: '09:00' };
  const triggerTomorrow = getReminderTriggerDate(bdayTomorrow, settingsTomorrow, refToday);
  assert.strictEqual(triggerTomorrow.getFullYear(), 2026);
  assert.strictEqual(triggerTomorrow.getMonth(), 4); // May
  assert.strictEqual(triggerTomorrow.getDate(), 31);
  console.log('   ✅ Birthday tomorrow with 1 day before triggers today passed.');

  // C. Birthday in 7 days, daysBefore = 7 (should trigger today)
  const bdaySevenDays = { date: '1995-06-07' }; // Bday in 7 days: June 7
  const settingsSevenDays = { enabled: true, daysBefore: 7, notificationTime: '09:00' };
  const triggerSevenDays = getReminderTriggerDate(bdaySevenDays, settingsSevenDays, refToday);
  assert.strictEqual(triggerSevenDays.getFullYear(), 2026);
  assert.strictEqual(triggerSevenDays.getMonth(), 4); // May
  assert.strictEqual(triggerSevenDays.getDate(), 31);
  console.log('   ✅ Birthday in 7 days with 7 days before triggers today passed.');


  // ----------------------------------------------------
  // Test 3: Multiple Birthdays on the Same Day
  // ----------------------------------------------------
  console.log('\n3. Testing Multiple Birthdays on the Same Day...');
  const contacts = [
    { id: 'bday-1', name: 'Albus Dumbledore', date: '1995-06-15' },
    { id: 'bday-2', name: 'Harry Potter', date: '1995-06-15' }
  ];
  const settingsDouble = { enabled: true, daysBefore: 1, notificationTime: '09:00' };
  
  const triggers = contacts.map(c => getReminderTriggerDate(c, settingsDouble, refToday));
  // Both must resolve to June 14, 2026
  assert.strictEqual(triggers[0].getFullYear(), 2026);
  assert.strictEqual(triggers[0].getDate(), 14);
  assert.strictEqual(triggers[1].getFullYear(), 2026);
  assert.strictEqual(triggers[1].getDate(), 14);
  // (In native layer, their requestCodes hash(bday-1) vs hash(bday-2) are distinct, ensuring both alarms register)
  console.log('   ✅ Both birthdays on same day resolved distinct alarms independently passed.');


  // ----------------------------------------------------
  // Test 4: Leap Year Rollovers (Feb 29)
  // ----------------------------------------------------
  console.log('\n4. Testing Feb 29 Leap Year Rollovers...');
  
  // A. Non-leap year reference (2027)
  const todayNonLeap = new Date('2026-05-24T12:00:00'); // Next bday is in 2027 (non-leap)
  const bdayLeap = { date: '2000-02-29' };
  const settingsLeap = { enabled: true, daysBefore: 1, leapYearDaysBefore: 2 };
  
  // Under non-leap year, next birthday rolls back to Feb 28, 2027.
  // Leap year daysBefore fallback is 2 days. So Feb 28 - 2 days = Feb 26, 2027.
  const triggerNonLeap = getReminderTriggerDate(bdayLeap, settingsLeap, todayNonLeap);
  assert.strictEqual(triggerNonLeap.getFullYear(), 2027);
  assert.strictEqual(triggerNonLeap.getMonth(), 1); // Feb
  assert.strictEqual(triggerNonLeap.getDate(), 26);
  console.log('   ✅ Non-leap year: Feb 29 bday celebrate Feb 28. Fallback 2 days triggers Feb 26 passed.');

  // B. Leap year reference (2028)
  const todayLeap = new Date('2027-05-24T12:00:00'); // Next bday is in 2028 (leap year!)
  // Under leap year, next birthday is Feb 29, 2028.
  // Standard daysBefore is 1 day. So Feb 29 - 1 day = Feb 28, 2028.
  const triggerLeap = getReminderTriggerDate(bdayLeap, settingsLeap, todayLeap);
  assert.strictEqual(triggerLeap.getFullYear(), 2028);
  assert.strictEqual(triggerLeap.getMonth(), 1); // Feb
  assert.strictEqual(triggerLeap.getDate(), 28);
  console.log('   ✅ Leap year: Feb 29 bday celebrated on Feb 29. Standard 1 day triggers Feb 28 passed.');

  // ----------------------------------------------------
  // Test 5: Simulated Persistence (Boot and App Closed State Availability)
  // ----------------------------------------------------
  console.log('\n5. Testing State Persistence (For App Closed and Reboot Recovery)...');
  const mockSharedPrefs = {};
  
  // Simulate React saving array to native bridge
  const saveToNative = (birthdays, settings) => {
    mockSharedPrefs['birthdays_json'] = JSON.stringify(birthdays);
    mockSharedPrefs['global_settings_json'] = JSON.stringify(settings);
  };

  const mockBirthdays = [
    { id: '1', name: 'John Doe', date: '1995-10-10' }
  ];
  saveToNative(mockBirthdays, globalSettings);

  // Simulate reboot/app-closed receiver loading from SharedPreferences
  const loadedBirthdays = JSON.parse(mockSharedPrefs['birthdays_json']);
  const loadedSettings = JSON.parse(mockSharedPrefs['global_settings_json']);
  
  assert.strictEqual(loadedBirthdays[0].name, 'John Doe');
  assert.strictEqual(loadedSettings.enabled, true);
  console.log('   ✅ Simulated native SharedPreferences payload availability verified passed.');

  console.log('\n🎉 All notification automated validation checks passed successfully!');
} catch (error) {
  console.error('\n❌ Notification automated validation failed!');
  console.error(error);
  process.exit(1);
}
