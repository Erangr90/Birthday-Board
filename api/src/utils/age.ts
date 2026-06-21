export const MIN_USER_AGE = 6;
export const MAX_USER_AGE = 100;

export function getAge(
  birthDate: Date,
  referenceDate: Date = new Date()
): number {
  const birth = new Date(birthDate);
  let age = referenceDate.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = referenceDate.getUTCMonth() - birth.getUTCMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && referenceDate.getUTCDate() < birth.getUTCDate())
  ) {
    age--;
  }

  return age;
}

export function isUserAgeValid(
  birthDate: Date,
  referenceDate: Date = new Date()
): boolean {
  const age = getAge(birthDate, referenceDate);
  return age >= MIN_USER_AGE && age <= MAX_USER_AGE;
}

export function getUserBirthYearRange(referenceDate: Date = new Date()) {
  const currentYear = referenceDate.getFullYear();
  return {
    minYear: currentYear - MAX_USER_AGE,
    maxYear: currentYear - MIN_USER_AGE
  };
}
