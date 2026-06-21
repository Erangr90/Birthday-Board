import { z } from "zod"
import {
  isUserAgeValid,
  isValidCalendarDate,
  MAX_USER_AGE,
  MIN_USER_AGE,
} from "../utils/age"


export const NAME_PATTERN = /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/
export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,50}$/

export const nameSchema = z
  .string({ message: "Name is required" })
  .min(2, "Name must be at least 2 characters long")
  .max(50, "Name must be at most 50 characters long")
  .regex(
    NAME_PATTERN,
    "user's name must start with a capital letter; each additional name must start with a capital letter"
  )

export const emailSchema = z
  .email("Invalid email address")
  .regex(EMAIL_PATTERN, "email is not valid")

export const passwordSchema = z
  .string({ error: "password is required" })
  .min(8, "password must be at least 8 characters")
  .max(50, "password can contain up to 50 characters")
  .regex(
    PASSWORD_PATTERN,
    "password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
  )


export const birthDateFieldsSchema = {
  birthYear: z
    .string({ message: "Year is required" })
    .min(1, "Year is required"),
  birthMonth: z
    .string({ message: "Month is required" })
    .min(1, "Month is required"),
  birthDay: z.string({ message: "Day is required" }).min(1, "Day is required"),
}


export function refineBirthDate(
  data: { birthYear: string; birthMonth: string; birthDay: string },
  ctx: z.RefinementCtx
) {
  const year = Number(data.birthYear)
  const month = Number(data.birthMonth)
  const day = Number(data.birthDay)

  if (!isValidCalendarDate(year, month, day)) {
    ctx.addIssue({
      code: "custom",
      message: "Please choose a valid date",
      path: ["birthDay"],
    })
    return
  }

  const birthDate = new Date(year, month - 1, day)

  if (birthDate > new Date()) {
    ctx.addIssue({
      code: "custom",
      message: "birth date cannot be in the future",
      path: ["birthYear"],
    })
    return
  }

  if (!isUserAgeValid(birthDate)) {
    ctx.addIssue({
      code: "custom",
      message: `Age must be between ${MIN_USER_AGE} and ${MAX_USER_AGE} years old`,
      path: ["birthYear"],
    })
  }
}
