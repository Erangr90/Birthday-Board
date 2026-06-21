export const BIRTHDAY_MONTH_MIN = 1;
export const BIRTHDAY_MONTH_MAX = 12;
export const BIRTHDAY_DAY_MIN = 1;
export const BIRTHDAY_DAY_MAX = 31;
export const APP_TIMEZONE = "Asia/Jerusalem";


const dateFormatters = new Map<string, Intl.DateTimeFormat>();
const timeFormatters = new Map<string, Intl.DateTimeFormat>();

function getDateFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(timeZone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric"
    });
    dateFormatters.set(timeZone, formatter);
  }

  return formatter;
}

function getTimeFormatter(timeZone: string): Intl.DateTimeFormat {
  let formatter = timeFormatters.get(timeZone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23"
    });
    timeFormatters.set(timeZone, formatter);
  }

  return formatter;
}

export function getMonthDayInTimezone(
  date: Date,
  timeZone: string = APP_TIMEZONE
): { year: number; month: number; day: number } {
  const parts = getDateFormatter(timeZone).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value)
  };
}

export function getSecondsUntilEndOfDayInTimezone(
  referenceDate: Date = new Date(),
  timeZone: string = APP_TIMEZONE
): number {
  const timeParts = getTimeFormatter(timeZone).formatToParts(referenceDate);

  const hour = Number(timeParts.find((part) => part.type === "hour")?.value);
  const minute = Number(timeParts.find((part) => part.type === "minute")?.value);
  const second = Number(timeParts.find((part) => part.type === "second")?.value);
  const secondsSinceMidnight = hour * 3600 + minute * 60 + second;

  return Math.max(1, 86400 - secondsSinceMidnight);
}

export function getBirthdayMonthDay(birthDate: Date): {
  month: number;
  day: number;
} {
  const date = new Date(birthDate);

  return {
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  };
}

export function parseIsoDateParts(
  value: string
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

export function isRealDateInYear(
  year: number,
  month: number,
  day: number
): boolean {
  if (
    !Number.isInteger(year) ||
    !isValidBirthdayMonth(month) ||
    !isValidBirthdayDay(day)
  ) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

export function isBirthDateStringValid(value: string): boolean {
  const parts = parseIsoDateParts(value);

  if (!parts) {
    return false;
  }

  return isRealDateInYear(parts.year, parts.month, parts.day);
}

export function isValidBirthdayMonth(month: number): boolean {
  return (
    Number.isInteger(month) &&
    month >= BIRTHDAY_MONTH_MIN &&
    month <= BIRTHDAY_MONTH_MAX
  );
}

export function isValidBirthdayDay(day: number): boolean {
  return (
    Number.isInteger(day) &&
    day >= BIRTHDAY_DAY_MIN &&
    day <= BIRTHDAY_DAY_MAX
  );
}

export function isValidBirthdayMonthDay(month: number, day: number): boolean {
  return isRealDateInYear(2000, month, day);
}

export function isBirthDateCalendarValid(birthDate: Date): boolean {
  if (Number.isNaN(birthDate.getTime())) {
    return false;
  }

  return isRealDateInYear(
    birthDate.getUTCFullYear(),
    birthDate.getUTCMonth() + 1,
    birthDate.getUTCDate()
  );
}

export function formatBirthDateDisplay(birthDate: Date): string {
  const date = new Date(birthDate);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export function formatBirthDateMonthDayDisplay(birthDate: Date): string {
  const date = new Date(birthDate);
  const day = date.getUTCDate();
  const monthName = MONTH_NAMES[date.getUTCMonth()];

  return `${monthName} ${day}`;
}

export function birthDateMatchesMonthDay(
  birthDate: Date,
  month: number,
  day: number
): boolean {
  const parts = getBirthdayMonthDay(birthDate);
  return parts.month === month && parts.day === day;
}

function getDayOfYear(year: number, month: number, day: number): number {
  const date = Date.UTC(year, month - 1, day);
  const start = Date.UTC(year, 0, 0);

  return Math.floor((date - start) / 86400000);
}

function resolveBirthdayMonthDayForYear(
  month: number,
  day: number,
  year: number
): { month: number; day: number } {
  if (isRealDateInYear(year, month, day)) {
    return { month, day };
  }

  for (let candidateDay = day - 1; candidateDay >= 1; candidateDay--) {
    if (isRealDateInYear(year, month, candidateDay)) {
      return { month, day: candidateDay };
    }
  }

  return { month, day };
}

export function getDaysUntilNextBirthday(
  birthMonth: number,
  birthDay: number,
  referenceDate: Date = new Date(),
  timeZone: string = APP_TIMEZONE
): number {
  const { year, month, day } = getMonthDayInTimezone(referenceDate, timeZone);
  const todayDayOfYear = getDayOfYear(year, month, day);
  const birthdayThisYear = resolveBirthdayMonthDayForYear(
    birthMonth,
    birthDay,
    year
  );
  const birthdayDayOfYear = getDayOfYear(
    year,
    birthdayThisYear.month,
    birthdayThisYear.day
  );

  if (birthdayDayOfYear >= todayDayOfYear) {
    return birthdayDayOfYear - todayDayOfYear;
  }

  const nextYear = year + 1;
  const birthdayNextYear = resolveBirthdayMonthDayForYear(
    birthMonth,
    birthDay,
    nextYear
  );
  const nextBirthdayDayOfYear = getDayOfYear(
    nextYear,
    birthdayNextYear.month,
    birthdayNextYear.day
  );
  const daysInYear = getDayOfYear(year, 12, 31);

  return daysInYear - todayDayOfYear + nextBirthdayDayOfYear;
}
