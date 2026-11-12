import { getNextBirthday, getReminderTriggerDate, parseDate } from './dateHelpers.js';

export const DEFAULT_GLOBAL_SETTINGS = {
  enabled: true,
  daysBefore: 1,
  notificationTime: '09:00',
  leapYearDaysBefore: 1
};

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Parses an "HH:MM" string. Midnight ("00:xx") is valid and must stay 0,
 * only a missing / malformed value falls back to 09:00.
 */
export function parseTime(timeStr) {
  const [h, m] = String(timeStr || '').split(':').map((p) => parseInt(p, 10));
  const valid = Number.isInteger(h) && h >= 0 && h <= 23 && Number.isInteger(m) && m >= 0 && m <= 59;
  return valid ? { hours: h, minutes: m } : { hours: 9, minutes: 0 };
}

/** Whole calendar days between two dates (ignores time of day and DST shifts). */
export function calendarDaysBetween(from, to) {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / DAY_MS);
}

/** Notification time that applies to this contact (custom override or global). */
export function getActiveNotificationTime(contact, globalSettings) {
  const custom = contact && contact.customReminders;
  if (custom && custom.enabled === true) {
    return custom.notificationTime || '09:00';
  }
  return (globalSettings && globalSettings.notificationTime) || '09:00';
}

/**
 * Works out when this contact's reminder fires relative to `now`.
 * Returns null when no reminder applies (disabled / invalid date).
 */
export function getReminderSchedule(contact, globalSettings, now = new Date()) {
  if (!contact || !contact.date) return null;

  const triggerDate = getReminderTriggerDate(contact, globalSettings, now);
  if (!triggerDate) return null;

  const { hours, minutes } = parseTime(getActiveNotificationTime(contact, globalSettings));
  const triggerTime = new Date(
    triggerDate.getFullYear(),
    triggerDate.getMonth(),
    triggerDate.getDate(),
    hours,
    minutes,
    0,
    0
  );

  const uniqueKey = `${contact.id}_${triggerTime.getFullYear()}_${triggerTime.getMonth()}_${triggerTime.getDate()}_${hours}_${minutes}`;

  return {
    triggerTime,
    birthday: getNextBirthday(contact.date, now), // Feb 29 -> Feb 28 in non-leap years
    uniqueKey
  };
}

/**
 * Builds the notification text. `daysLeft` is measured from the day the
 * notification is actually shown, so a late delivery never says "tomorrow"
 * on the birthday itself.
 */
export function buildNotificationContent(contact, daysLeft, birthday) {
  const name = (contact.name || '').trim() || 'Someone';
  // No emoji in the title: iOS already shows the app icon and the in-app banner its own cake.
  const title = 'Birthday Reminder';
  const NBSP = '\u00A0'; // keeps the trailing emoji on the same line as the last word

  let body;
  if (daysLeft <= 0) {
    body = `Today is ${name}'s birthday!${NBSP}🎉`;
    const dob = parseDate(contact.date);
    if (!contact.hideYear && dob && birthday) {
      const age = birthday.getFullYear() - dob.getFullYear();
      if (age > 0) body += ` Turns ${age} today.`;
    }
  } else if (daysLeft === 1) {
    body = `${name}'s birthday is tomorrow!${NBSP}🎈`;
  } else {
    body = `${name}'s birthday is in ${daysLeft} days!${NBSP}🎁`;
  }

  return { title, body };
}

/**
 * Returns the reminders that should be shown right now: trigger time has
 * passed within the last 24 hours and they have not been sent yet.
 *
 * Individual (custom) reminders are evaluated even when the common/global
 * reminder switch is off.
 */
export function getDueReminders(birthdays, globalSettings, now = new Date(), sentReminders = {}) {
  const settings = { ...DEFAULT_GLOBAL_SETTINGS, ...(globalSettings || {}) };
  const due = [];

  (birthdays || []).forEach((contact) => {
    const schedule = getReminderSchedule(contact, settings, now);
    if (!schedule) return;

    const diffMs = now.getTime() - schedule.triggerTime.getTime();
    const inWindow = diffMs >= 0 && diffMs < DAY_MS;
    if (!inWindow || sentReminders[schedule.uniqueKey]) return;

    const daysLeft = calendarDaysBetween(now, schedule.birthday);
    due.push({
      contact,
      uniqueKey: schedule.uniqueKey,
      daysLeft,
      ...buildNotificationContent(contact, daysLeft, schedule.birthday)
    });
  });

  return due;
}

/** Drops "already sent" markers older than ~13 months so localStorage doesn't grow forever. */
export function pruneSentReminders(sentReminders, now = new Date()) {
  const maxAge = 400 * DAY_MS;
  const pruned = {};
  Object.entries(sentReminders || {}).forEach(([key, ts]) => {
    if (typeof ts === 'number' && now.getTime() - ts < maxAge) pruned[key] = ts;
  });
  return pruned;
}
