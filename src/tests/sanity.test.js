/* global process */
import assert from 'assert';
import { getNextBirthday, getCountdown, getAgeInfo, getReminderTriggerDate } from '../utils/dateHelpers.js';

console.log('🧪 Starting Birthday Reminder PWA Sanity Tests...\n');

try {
  // Test Case 1: Standard birthday calculation in future
  console.log('1. Testing standard upcoming birthday...');
  const today1 = new Date('2026-05-24T12:00:00');
  const dob1 = '1995-06-15';
  const nextBday1 = getNextBirthday(dob1, today1);
  assert.strictEqual(nextBday1.getFullYear(), 2026);
  assert.strictEqual(nextBday1.getMonth(), 5); // June (0-indexed 5)
  assert.strictEqual(nextBday1.getDate(), 15);
  console.log('✅ Standard upcoming birthday check passed.');

  // Test Case 2: Standard birthday already passed this year
  console.log('2. Testing birthday that has passed this year...');
  const today2 = new Date('2026-05-24T12:00:00');
  const dob2 = '1995-04-10';
  const nextBday2 = getNextBirthday(dob2, today2);
  assert.strictEqual(nextBday2.getFullYear(), 2027);
  assert.strictEqual(nextBday2.getMonth(), 3); // April (0-indexed 3)
  assert.strictEqual(nextBday2.getDate(), 10);
  console.log('✅ Passed birthday check passed.');

  // Test Case 3: Leap Year birthday (Feb 29) in non-leap year (celebrated Feb 28)
  console.log('3. Testing Feb 29 birthday in a non-leap year (2027)...');
  const today3 = new Date('2026-05-24T12:00:00');
  const dobLeap = '1996-02-29';
  const nextBday3 = getNextBirthday(dobLeap, today3);
  // Next year is 2027 (non-leap), so birthday should fall on Feb 28, 2027
  assert.strictEqual(nextBday3.getFullYear(), 2027);
  assert.strictEqual(nextBday3.getMonth(), 1); // Feb (0-indexed 1)
  assert.strictEqual(nextBday3.getDate(), 28);
  console.log('✅ Leap year (Feb 29) birthday in non-leap year check passed.');

  // Test Case 4: Leap Year birthday (Feb 29) in a leap year (2028)
  console.log('4. Testing Feb 29 birthday in a leap year (2028)...');
  const today4 = new Date('2027-05-24T12:00:00');
  const nextBday4 = getNextBirthday(dobLeap, today4);
  // Next year is 2028 (leap), so birthday should be Feb 29, 2028
  assert.strictEqual(nextBday4.getFullYear(), 2028);
  assert.strictEqual(nextBday4.getMonth(), 1); // Feb (0-indexed 1)
  assert.strictEqual(nextBday4.getDate(), 29);
  console.log('✅ Leap year (Feb 29) birthday in leap year check passed.');

  // Test Case 5: Countdown calculations
  console.log('5. Testing countdown calculations...');
  const today5 = new Date('2026-06-14T23:59:50');
  const nextBday5 = new Date(2026, 5, 15); // June 15
  const countdown = getCountdown(nextBday5, today5);
  // Should be 10 seconds remaining (0 days, 0 hours, 0 mins, 10 secs)
  assert.strictEqual(countdown.days, 0);
  assert.strictEqual(countdown.hours, 0);
  assert.strictEqual(countdown.minutes, 0);
  assert.strictEqual(countdown.seconds, 10);
  assert.strictEqual(countdown.isToday, false);
  console.log('✅ Countdown calculations check passed.');

  // Test Case 6: Countdown today check
  console.log('6. Testing countdown when today is the birthday...');
  const today6 = new Date('2026-06-15T12:00:00');
  const nextBday6 = new Date(2026, 5, 15);
  const countdownToday = getCountdown(nextBday6, today6);
  assert.strictEqual(countdownToday.isToday, true);
  console.log('✅ Countdown "isToday" check passed.');

  // Test Case 7: Age Info Calculations
  console.log('7. Testing age information calculations...');
  const dob7 = '1995-06-15';
  const nextBday7 = new Date(2026, 5, 15); // June 15, 2026
  const ageInfo = getAgeInfo(dob7, nextBday7);
  // Turning 31 in 2026 (2026 - 1995). Current age is 30.
  assert.strictEqual(ageInfo.currentAge, 30);
  assert.strictEqual(ageInfo.nextAge, 31);
  console.log('✅ Age calculations check passed.');

  // Test Case 8: Leap Year reminder fallback in non-leap year (2027)
  console.log('8. Testing Feb 29 reminder fallback calculation in non-leap year (2027)...');
  const bday8 = { date: '1996-02-29' };
  const today8 = new Date('2026-05-24T12:00:00'); // Next birthday is in 2027 (non-leap)
  const settings8 = {
    enabled: true,
    daysBefore: 2,
    notificationTime: '09:00',
    leapYearDaysBefore: 3
  };
  const triggerDate8 = getReminderTriggerDate(bday8, settings8, today8);
  // Next birthday is Feb 28, 2027. Leap year fallback is 3 days before.
  // Feb 28 - 3 days = Feb 25, 2027.
  assert.strictEqual(triggerDate8.getFullYear(), 2027);
  assert.strictEqual(triggerDate8.getMonth(), 1); // Feb (0-indexed 1)
  assert.strictEqual(triggerDate8.getDate(), 25);
  console.log('✅ Leap year reminder fallback calculation passed.');

  // Test Case 9: Custom reminder overrides
  console.log('9. Testing custom reminder overrides...');
  // A. Custom reminders enabled on birthday (should override global settings)
  const bday9A = {
    date: '1995-06-15',
    customReminders: {
      enabled: true,
      daysBefore: 5,
      notificationTime: '10:00'
    }
  };
  const today9 = new Date('2026-05-24T12:00:00'); // Next bday is June 15, 2026
  const triggerDate9A = getReminderTriggerDate(bday9A, settings8, today9);
  // Expected: June 15 - 5 days = June 10, 2026
  assert.strictEqual(triggerDate9A.getFullYear(), 2026);
  assert.strictEqual(triggerDate9A.getMonth(), 5); // June
  assert.strictEqual(triggerDate9A.getDate(), 10);
  console.log('✅ Custom reminder override (enabled) verified.');

  // B. Custom reminders disabled on birthday (should return null trigger date)
  const bday9B = {
    date: '1995-06-15',
    customReminders: {
      enabled: false,
      daysBefore: 5,
      notificationTime: '10:00'
    }
  };
  const triggerDate9B = getReminderTriggerDate(bday9B, settings8, today9);
  assert.strictEqual(triggerDate9B, null);
  console.log('✅ Custom reminder override (disabled) verified.');

  console.log('\n🎉 All sanity checks passed successfully!');
} catch (error) {
  console.error('\n❌ Sanity checks failed!');
  console.error(error);
  process.exit(1);
}
