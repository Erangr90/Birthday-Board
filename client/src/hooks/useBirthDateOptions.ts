import { useMemo } from "react"
import { getDaysInMonth, getUserBirthYearRange } from "../utils/age"


export function useBirthDateOptions(birthYear: string, birthMonth: string) {
  const { minYear, maxYear } = getUserBirthYearRange()

  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: maxYear - minYear + 1 },
        (_, index) => maxYear - index
      ),
    [maxYear, minYear]
  )

  const dayOptions = useMemo(() => {
    const year = Number(birthYear)
    const month = Number(birthMonth)

    if (!year || !month) {
      return Array.from({ length: 31 }, (_, index) => index + 1)
    }

    return Array.from(
      { length: getDaysInMonth(year, month) },
      (_, index) => index + 1
    )
  }, [birthYear, birthMonth])

  return { yearOptions, dayOptions, minYear, maxYear }
}
