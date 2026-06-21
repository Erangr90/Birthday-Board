export const MIN_USER_AGE = 6
export const MAX_USER_AGE = 100

export function getAge(
  birthDate: Date,
  referenceDate: Date = new Date()
): number {
  const birth = new Date(birthDate)
  let age = referenceDate.getFullYear() - birth.getFullYear()
  const monthDiff = referenceDate.getMonth() - birth.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getDate() < birth.getDate())
  ) {
    age--
  }

  return age
}

export function isUserAgeValid(
  birthDate: Date,
  referenceDate: Date = new Date()
): boolean {
  const age = getAge(birthDate, referenceDate)
  return age >= MIN_USER_AGE && age <= MAX_USER_AGE
}

export function getUserBirthYearRange(referenceDate: Date = new Date()) {
  const currentYear = referenceDate.getFullYear()
  return {
    minYear: currentYear - MAX_USER_AGE,
    maxYear: currentYear - MIN_USER_AGE,
  }
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function isValidCalendarDate(
  year: number,
  month: number,
  day: number
): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false
  }

  if (month < 1 || month > 12 || day < 1) {
    return false
  }

  return day <= getDaysInMonth(year, month)
}

export function formatBirthDate(
  year: string,
  month: string,
  day: string
): string {
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
}

export const MONTH_OPTIONS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]
