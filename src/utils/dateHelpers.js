/**
 * Parses a date string (YYYY-MM-DD) safely.
 * @param {string} dobString
 * @returns {Date|null}
 */
export function parseDate(dobString) {
  if (!dobString) return null;
  const parts = dobString.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const localDate = new Date(y, m, d);
    return isNaN(localDate.getTime()) ? null : localDate;
  }
  const d = new Date(dobString);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Calculates the next occurrence of a birthday.
 * If the birthday is today, it returns today's date.
 * If the birthday is on Feb 29 and the target year is a non-leap year,
 * it returns Feb 28 (as per implementation plan).
 * 
 * @param {string} dobString - Birthdate in YYYY-MM-DD format
 * @param {Date} [today] - Custom reference date (useful for testing)
 * @returns {Date|null}
 */
export function getNextBirthday(dobString, today = new Date()) {
  const dob = parseDate(dobString);
  if (!dob) return null;

  const birthMonth = dob.getMonth();
  const birthDay = dob.getDate();
  const currentYear = today.getFullYear();

  // Create a birthday date for the current year
  let nextBday = new Date(currentYear, birthMonth, birthDay);

  // Handle Feb 29 leap year rollover
  if (birthMonth === 1 && birthDay === 29 && nextBday.getMonth() !== 1) {
    // Target year is not a leap year; roll back to Feb 28
    nextBday = new Date(currentYear, 1, 28);
  }

  // Create start of day representations for correct day-based comparison
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const nextBdayStart = new Date(nextBday.getFullYear(), nextBday.getMonth(), nextBday.getDate());

  // If the birthday has already passed this year, compute for the next year
  if (nextBdayStart < todayStart) {
    const nextYear = currentYear + 1;
    nextBday = new Date(nextYear, birthMonth, birthDay);

    // Handle Feb 29 leap year rollover for next year
    if (birthMonth === 1 && birthDay === 29 && nextBday.getMonth() !== 1) {
      nextBday = new Date(nextYear, 1, 28);
    }
  }

  return nextBday;
}

/**
 * Calculates the exact countdown duration from "today" to the next birthday.
 * 
 * @param {Date} nextBirthday - The next birthday Date object
 * @param {Date} [today] - The current time Date object
 * @returns {Object} { days, hours, minutes, seconds, isToday }
 */
export function getCountdown(nextBirthday, today = new Date()) {
  if (!nextBirthday) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false };
  }

  // Check if today is the birthday (comparing month and date)
  const isBdayToday = 
    today.getMonth() === nextBirthday.getMonth() && 
    today.getDate() === nextBirthday.getDate();

  if (isBdayToday) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true };
  }

  // Set nextBirthday to start of its day (00:00:00)
  const targetTime = new Date(
    nextBirthday.getFullYear(),
    nextBirthday.getMonth(),
    nextBirthday.getDate()
  ).getTime();

  const diffMs = targetTime - today.getTime();

  if (diffMs <= 0) {
    // If the birthday time has passed but it is still technically the birthday day
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isToday: true };
  }

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, isToday: false };
}

/**
 * Calculates current age and the upcoming age.
 * 
 * @param {string} dobString - Birthdate in YYYY-MM-DD format
 * @param {Date} nextBirthday - Next birthday Date object
 * @returns {Object} { currentAge, nextAge }
 */
export function getAgeInfo(dobString, nextBirthday) {
  const dob = parseDate(dobString);
  if (!dob || !nextBirthday) return { currentAge: 0, nextAge: 0 };

  const birthYear = dob.getFullYear();
  const nextAge = nextBirthday.getFullYear() - birthYear;
  const currentAge = Math.max(0, nextAge - 1);

  return { currentAge, nextAge };
}

/**
 * Sorts birthdays based on the days remaining to their next birthday.
 * 
 * @param {Array} birthdays - Array of birthday items
 * @param {Date} [today] - Reference date
 * @returns {Array} Sorted birthdays
 */
export function sortBirthdays(birthdays, today = new Date()) {
  return [...birthdays].sort((a, b) => {
    const nextA = getNextBirthday(a.date, today);
    const nextB = getNextBirthday(b.date, today);
    if (!nextA) return 1;
    if (!nextB) return -1;
    return nextA.getTime() - nextB.getTime();
  });
}

/**
 * Calculates the reminder trigger date for a given birthday record.
 * Uses custom reminder settings if enabled, otherwise falls back to global settings.
 * 
 * @param {Object} birthday - The birthday record object
 * @param {Object} globalSettings - Global reminders settings from localStorage
 * @param {Date} [today] - Custom reference date
 * @returns {Date|null}
 */
export function getReminderTriggerDate(birthday, globalSettings, today = new Date()) {
  if (!birthday || !birthday.date) return null;

  const dob = parseDate(birthday.date);
  if (!dob) return null;

  // Determine active settings (custom overrides vs global fallbacks)
  const isCustom = birthday.customReminders && typeof birthday.customReminders === 'object';
  const customEnabled = isCustom ? birthday.customReminders.enabled : null;

  // If custom reminders are explicitly disabled for this contact, return null (no trigger)
  if (customEnabled === false) {
    return null;
  }

  // If global reminders are disabled and no custom reminders are enabled, return null
  const globalEnabled = globalSettings ? globalSettings.enabled : true;
  if (customEnabled !== true && !globalEnabled) {
    return null;
  }

  const activeSettings = {
    daysBefore: (isCustom && customEnabled) ? birthday.customReminders.daysBefore : (globalSettings?.daysBefore ?? 1),
    leapYearDaysBefore: (isCustom && customEnabled) ? (birthday.customReminders.leapYearDaysBefore ?? birthday.customReminders.daysBefore) : (globalSettings?.leapYearDaysBefore ?? 1)
  };

  const birthMonth = dob.getMonth();
  const birthDay = dob.getDate();
  const isFeb29 = birthMonth === 1 && birthDay === 29;

  const nextBday = getNextBirthday(birthday.date, today);
  if (!nextBday) return null;

  const targetYear = nextBday.getFullYear();
  const isLeapYear = (targetYear % 4 === 0 && targetYear % 100 !== 0) || (targetYear % 400 === 0);

  let daysBefore = activeSettings.daysBefore || 0;
  let baseDate = nextBday;

  // Handle Feb 29 in non-leap year
  if (isFeb29 && !isLeapYear) {
    daysBefore = activeSettings.leapYearDaysBefore || 0;
    baseDate = new Date(targetYear, 1, 28);
  }

  // Calculate the notification date
  const triggerDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() - daysBefore);
  return triggerDate;
}
