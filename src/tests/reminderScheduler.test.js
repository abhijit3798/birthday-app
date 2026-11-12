/* global process */
import assert from 'assert';
import {
  getDueReminders,
  getReminderSchedule,
  buildNotificationContent,
  pruneSentReminders,
  parseTime,
  calendarDaysBetween
} from '../utils/reminderScheduler.js';

let passed = 0;
const failures = [];
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`   ✅ ${name}`);
  } catch (err) {
    failures.push(name);
    console.log(`   ❌ ${name}\n      ${err.message}`);
  }
}

const at = (y, m, d, h = 0, min = 0) => new Date(y, m - 1, d, h, min, 0, 0);
const GLOBAL_ON = { enabled: true, daysBefore: 1, notificationTime: '09:00', leapYearDaysBefore: 1 };
const GLOBAL_OFF = { ...GLOBAL_ON, enabled: false };
const custom = (daysBefore, notificationTime = '09:00', enabled = true) => ({
  enabled, daysBefore, notificationTime, leapYearDaysBefore: 1 // 1 = hard-coded default stored by DetailView
});

console.log(`🧪 Reminder scheduler tests (TZ=${process.env.TZ || 'system'})\n`);

console.log('1. Common (global) reminder');
test('fires on the day before at the global time', () => {
  const rahul = { id: 'r', name: 'Rahul', date: '1995-06-05' };
  assert.strictEqual(getDueReminders([rahul], GLOBAL_ON, at(2026, 6, 4, 8, 59)).length, 0);
  const due = getDueReminders([rahul], GLOBAL_ON, at(2026, 6, 4, 9, 0));
  assert.strictEqual(due.length, 1);
  assert.strictEqual(due[0].body, "Rahul's birthday is tomorrow!\u00A0🎈");
});
test('does not fire when common reminders are off', () => {
  const rahul = { id: 'r', name: 'Rahul', date: '1995-06-05' };
  assert.strictEqual(getDueReminders([rahul], GLOBAL_OFF, at(2026, 6, 4, 10)).length, 0);
});
test('changing the global time moves the reminder', () => {
  const rahul = { id: 'r', name: 'Rahul', date: '1995-06-05' };
  const s = { ...GLOBAL_ON, notificationTime: '21:15' };
  assert.strictEqual(getDueReminders([rahul], s, at(2026, 6, 4, 21, 14)).length, 0);
  assert.strictEqual(getDueReminders([rahul], s, at(2026, 6, 4, 21, 15)).length, 1);
});
test('global settings saved as strings still work', () => {
  const rahul = { id: 'r', name: 'Rahul', date: '1995-06-05' };
  const s = { enabled: true, daysBefore: '3', notificationTime: '09:00', leapYearDaysBefore: '1' };
  const due = getDueReminders([rahul], s, at(2026, 6, 2, 9, 30));
  assert.strictEqual(due.length, 1);
  assert.strictEqual(due[0].daysLeft, 3);
});

console.log('\n2. Individual (custom) reminder');
test('custom days + time override the global settings', () => {
  const priya = { id: 'p', name: 'Priya', date: '1990-06-05', customReminders: custom(3, '07:30') };
  assert.strictEqual(getDueReminders([priya], GLOBAL_ON, at(2026, 6, 4, 9, 0)).length, 0, 'global day must be ignored');
  assert.strictEqual(getDueReminders([priya], GLOBAL_ON, at(2026, 6, 2, 7, 29)).length, 0);
  const due = getDueReminders([priya], GLOBAL_ON, at(2026, 6, 2, 7, 30));
  assert.strictEqual(due.length, 1);
  assert.strictEqual(due[0].body, "Priya's birthday is in 3 days!\u00A0🎁");
});
test('custom reminder still fires when the common switch is OFF', () => {
  const priya = { id: 'p', name: 'Priya', date: '1990-06-05', customReminders: custom(2, '10:00') };
  const due = getDueReminders([priya], GLOBAL_OFF, at(2026, 6, 3, 10, 5));
  assert.strictEqual(due.length, 1);
});
test('custom reminder switched OFF means no reminder for that person', () => {
  const priya = { id: 'p', name: 'Priya', date: '1990-06-05', customReminders: custom(1, '09:00', false) };
  assert.strictEqual(getDueReminders([priya], GLOBAL_ON, at(2026, 6, 4, 9, 30)).length, 0);
});
test('custom time at midnight (12:30 AM) fires at 00:30, not 09:00', () => {
  const amit = { id: 'a', name: 'Amit', date: '1992-06-05', customReminders: custom(0, '00:30') };
  assert.strictEqual(getDueReminders([amit], GLOBAL_ON, at(2026, 6, 5, 0, 29)).length, 0);
  const due = getDueReminders([amit], GLOBAL_ON, at(2026, 6, 5, 0, 30));
  assert.strictEqual(due.length, 1);
});
test('global time at midnight works too', () => {
  const amit = { id: 'a', name: 'Amit', date: '1992-06-05' };
  const s = { ...GLOBAL_ON, daysBefore: 0, notificationTime: '00:00' };
  assert.strictEqual(getDueReminders([amit], s, at(2026, 6, 5, 0, 0)).length, 1);
});
test('0 days before = reminder on the birthday itself with age', () => {
  const amit = { id: 'a', name: 'Amit', date: '1992-06-05', customReminders: custom(0, '08:00') };
  const due = getDueReminders([amit], GLOBAL_ON, at(2026, 6, 5, 8, 0));
  assert.strictEqual(due[0].body, "Today is Amit's birthday!\u00A0🎉 Turns 34 today.");
});
test('age hidden when "hide year" is on', () => {
  const amit = { id: 'a', name: 'Amit', date: '1992-06-05', hideYear: true, customReminders: custom(0, '08:00') };
  const due = getDueReminders([amit], GLOBAL_ON, at(2026, 6, 5, 8, 0));
  assert.strictEqual(due[0].body, "Today is Amit's birthday!\u00A0🎉");
});
test('mixed list: each contact follows its own setting', () => {
  const list = [
    { id: 'g', name: 'Global', date: '1990-06-05' },
    { id: 'c', name: 'Custom', date: '1990-06-05', customReminders: custom(1, '18:00') },
    { id: 'x', name: 'Off', date: '1990-06-05', customReminders: custom(1, '09:00', false) }
  ];
  const due = getDueReminders(list, GLOBAL_ON, at(2026, 6, 4, 12, 0)).map((d) => d.contact.id);
  assert.deepStrictEqual(due, ['g']);
  const due2 = getDueReminders(list, GLOBAL_ON, at(2026, 6, 4, 18, 0)).map((d) => d.contact.id);
  assert.deepStrictEqual(due2.sort(), ['c', 'g']);
});

console.log('\n3. Timing window, duplicates, late delivery');
test('not shown again once marked as sent', () => {
  const rahul = { id: 'r', name: 'Rahul', date: '1995-06-05' };
  const [first] = getDueReminders([rahul], GLOBAL_ON, at(2026, 6, 4, 9, 0));
  const sent = { [first.uniqueKey]: Date.now() };
  assert.strictEqual(getDueReminders([rahul], GLOBAL_ON, at(2026, 6, 4, 9, 30), sent).length, 0);
});
test('app opened late (birthday morning) still shows it, and says "Today"', () => {
  const rahul = { id: 'r', name: 'Rahul', date: '1995-06-05' };
  const due = getDueReminders([rahul], GLOBAL_ON, at(2026, 6, 5, 8, 0));
  assert.strictEqual(due.length, 1);
  assert.ok(due[0].body.startsWith("Today is Rahul's birthday"), due[0].body);
});
test('more than 24h late = skipped (no stale reminder)', () => {
  const rahul = { id: 'r', name: 'Rahul', date: '1995-06-05', customReminders: custom(3) };
  assert.strictEqual(getDueReminders([rahul], GLOBAL_ON, at(2026, 6, 3, 9, 1)).length, 0);
});
test('year boundary: 1 Jan birthday, 3 days before -> 29 Dec', () => {
  const neha = { id: 'n', name: 'Neha', date: '2000-01-01', customReminders: custom(3) };
  const s = getReminderSchedule(neha, GLOBAL_ON, at(2026, 12, 1));
  assert.strictEqual(s.triggerTime.getTime(), at(2026, 12, 29, 9, 0).getTime());
  assert.strictEqual(getDueReminders([neha], GLOBAL_ON, at(2026, 12, 29, 9, 0))[0].daysLeft, 3);
});

console.log('\n4. 29 February birthdays');
test('non-leap year, common: uses "If Feb 29 doesn\'t exist" days before Feb 28', () => {
  const leap = { id: 'l', name: 'Leap', date: '2000-02-29' };
  const s = { ...GLOBAL_ON, daysBefore: 1, leapYearDaysBefore: 2 };
  const sched = getReminderSchedule(leap, s, at(2027, 1, 10));
  assert.strictEqual(sched.triggerTime.getTime(), at(2027, 2, 26, 9).getTime());
  const due = getDueReminders([leap], s, at(2027, 2, 26, 9, 0));
  assert.strictEqual(due[0].body, "Leap's birthday is in 2 days!\u00A0🎁", 'must not say "tomorrow"');
});
test('leap year, common: normal days before Feb 29', () => {
  const leap = { id: 'l', name: 'Leap', date: '2000-02-29' };
  const s = { ...GLOBAL_ON, daysBefore: 1, leapYearDaysBefore: 2 };
  const sched = getReminderSchedule(leap, s, at(2028, 1, 10));
  assert.strictEqual(sched.triggerTime.getTime(), at(2028, 2, 28, 9).getTime());
});
test('non-leap year, custom 5 days: uses the person\'s 5 days (not hidden default 1)', () => {
  const leap = { id: 'l', name: 'Leap', date: '2000-02-29', customReminders: custom(5, '08:00') };
  const sched = getReminderSchedule(leap, GLOBAL_ON, at(2027, 1, 10));
  assert.strictEqual(sched.triggerTime.getTime(), at(2027, 2, 23, 8).getTime());
});

console.log('\n5. Helpers');
test('parseTime keeps 00:xx and falls back only for bad values', () => {
  assert.deepStrictEqual(parseTime('00:05'), { hours: 0, minutes: 5 });
  assert.deepStrictEqual(parseTime('23:59'), { hours: 23, minutes: 59 });
  assert.deepStrictEqual(parseTime(''), { hours: 9, minutes: 0 });
  assert.deepStrictEqual(parseTime('25:00'), { hours: 9, minutes: 0 });
});
test('calendarDaysBetween ignores time of day', () => {
  assert.strictEqual(calendarDaysBetween(at(2026, 3, 1, 23, 59), at(2026, 3, 2, 0, 1)), 1);
});
test('notification text for a missing name', () => {
  assert.strictEqual(buildNotificationContent({ name: '  ', date: '2000-01-01' }, 2).body, "Someone's birthday is in 2 days!\u00A0🎁");
});
test('old "sent" markers are pruned, recent ones kept', () => {
  const now = at(2026, 6, 1);
  const pruned = pruneSentReminders({ old: at(2025, 1, 1).getTime(), recent: at(2026, 5, 1).getTime(), bad: 'x' }, now);
  assert.deepStrictEqual(Object.keys(pruned), ['recent']);
});

console.log('\n6. Two-year simulation (app checks every 30 minutes, like setInterval)');
test('every enabled reminder fires exactly once per year at the right time', () => {
  const contacts = [
    { id: 'g1', name: 'Global A', date: '1990-03-15' },
    { id: 'g2', name: 'Global NewYear', date: '1985-01-01' },
    { id: 'c1', name: 'Custom 7d', date: '1993-08-20', customReminders: custom(7, '18:30') },
    { id: 'c2', name: 'Custom midnight', date: '1999-11-12', customReminders: custom(0, '00:00') },
    { id: 'c3', name: 'Custom leap', date: '2000-02-29', customReminders: custom(2, '10:00') },
    { id: 'g3', name: 'Global leap', date: '1996-02-29' },
    { id: 'x1', name: 'Disabled', date: '1991-05-05', customReminders: custom(1, '09:00', false) }
  ];
  const settings = { enabled: true, daysBefore: 1, notificationTime: '09:00', leapYearDaysBefore: 3 };
  const expected = {
    2027: {
      g1: at(2027, 3, 14, 9), g2: at(2026, 12, 31, 9), c1: at(2027, 8, 13, 18, 30),
      c2: at(2027, 11, 12, 0), c3: at(2027, 2, 26, 10), g3: at(2027, 2, 25, 9)
    },
    2028: {
      g1: at(2028, 3, 14, 9), g2: at(2027, 12, 31, 9), c1: at(2028, 8, 13, 18, 30),
      c2: at(2028, 11, 12, 0), c3: at(2028, 2, 27, 10), g3: at(2028, 2, 28, 9)
    }
  };
  const fired = [];
  let sent = {};
  const start = at(2026, 12, 1).getTime();
  const end = at(2028, 12, 1).getTime();
  for (let t = start; t < end; t += 30 * 60 * 1000) {
    const now = new Date(t);
    getDueReminders(contacts, settings, now, sent).forEach((r) => {
      fired.push({ id: r.contact.id, when: now, daysLeft: r.daysLeft });
      sent[r.uniqueKey] = t;
    });
    sent = pruneSentReminders(sent, now);
  }
  assert.ok(!fired.some((f) => f.id === 'x1'), 'disabled contact must never fire');
  for (const year of [2027, 2028]) {
    for (const [id, when] of Object.entries(expected[year])) {
      const hits = fired.filter((f) => f.id === id && Math.abs(f.when - when) < 30 * 60 * 1000);
      assert.strictEqual(hits.length, 1, `${id} ${year}: expected 1 at ${when.toString()}, got ${hits.length}`);
    }
  }
  assert.strictEqual(fired.length, 12, `expected 12 reminders in total, got ${fired.length}`);
  const leap2027 = fired.find((f) => f.id === 'g3' && f.when.getFullYear() === 2027);
  assert.strictEqual(leap2027.daysLeft, 3);
});

console.log(`\n${failures.length === 0 ? '🎉' : '💥'} ${passed} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
