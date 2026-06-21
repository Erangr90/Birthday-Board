import { z } from "zod";
import {
  isBirthDateStringValid,
  isValidBirthdayMonthDay
} from "../utils/birthdayDate";
import {
  isUserAgeValid,
  MIN_USER_AGE,
  MAX_USER_AGE
} from "../utils/age";

export const USER_NAME_PATTERN = /^[A-Z][a-z]+(?: [A-Z][a-z]+)*$/;
export const USER_NAME_PATTERN_MESSAGE =
  "user's name must start with a capital letter; each additional name must start with a capital letter";

export const USER_AGE_MESSAGE = `user must be between ${MIN_USER_AGE} and ${MAX_USER_AGE} years old`;

export const birthDateSchema = z
  .string({ error: "birth date is required" })
  .refine((value) => isBirthDateStringValid(value), "birth date is not valid")
  .refine(
    (value) => new Date(value) <= new Date(),
    "birth date cannot be in the future"
  );

export const userBirthDateSchema = birthDateSchema.refine(
  (value) => isUserAgeValid(new Date(value)),
  USER_AGE_MESSAGE
);

export const userMonthSchema = z.coerce
  .number({ error: "month must be a number" })
  .int("month must be an integer")
  .min(1, "month must be between 1 and 12")
  .max(12, "month must be between 1 and 12");

export const userDaySchema = z.coerce
  .number({ error: "day must be a number" })
  .int("day must be an integer")
  .min(1, "day must be between 1 and 31")
  .max(31, "day must be between 1 and 31");

const emailSchema = z
  .email("email is not valid")
  .max(254, "email can contain up to 254 characters")
  .regex(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, "email is not valid")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string({ error: "password is required" })
  .min(8, "password must be at least 8 characters")
  .max(50, "password can contain up to 50 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,50}$/,
    "password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
  );

const userNameSchema = z
  .string({ error: "user's name is required" })
  .min(2, "user's name must be at least 2 characters")
  .max(50, "user's name can contain up to 50 characters")
  .regex(USER_NAME_PATTERN, USER_NAME_PATTERN_MESSAGE);

export const registerSchema = z.object({
  email: emailSchema,
  name: userNameSchema,
  password: passwordSchema,
  birthDate: userBirthDateSchema
});
export type RegisterValidation = z.infer<typeof registerSchema>;


export const sendCodeSchema = registerSchema;
export type SendCodeValidation = z.infer<typeof sendCodeSchema>;

const verificationCodeSchema = z
  .string({ error: "verification code is required" })
  .regex(/^\d{6}$/, "verification code must be 6 digits");


export const verifyRegisterSchema = registerSchema.extend({
  code: verificationCodeSchema
});
export type VerifyRegisterValidation = z.infer<typeof verifyRegisterSchema>;

export const createUserSchema = registerSchema;
export type CreateUserValidation = z.infer<typeof createUserSchema>;

export const updateCurrentUserSchema = registerSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "at least one field must be provided"
  );
export type UpdateCurrentUserValidation = z.infer<typeof updateCurrentUserSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});
export type LoginValidation = z.infer<typeof loginSchema>;

export const userIdSchema = z.object({
  id: z
    .string({ error: "user id is required" })
    .regex(/^[a-f\d]{24}$/i, "user id is not valid")
});
export type UserIdValidation = z.infer<typeof userIdSchema>;

export const SUSPEND_DURATIONS = [
  "none",
  "two_weeks",
  "one_month",
  "half_year",
  "one_year",
  "life"
] as const;
export type SuspendDuration = (typeof SUSPEND_DURATIONS)[number];

export const deleteUserSchema = z.object({
  suspendDuration: z
    .enum(SUSPEND_DURATIONS, { error: "suspend duration is not valid" })
    .default("none")
});
export type DeleteUserValidation = z.infer<typeof deleteUserSchema>;

export const paginationSchema = z.object({
  page: z.coerce
    .number({ error: "page must be a number" })
    .int("page must be an integer")
    .min(1, "page must be at least 1")
    .default(1),
  limit: z.coerce
    .number({ error: "limit must be a number" })
    .int("limit must be an integer")
    .min(1, "limit must be at least 1")
    .max(100, "limit cannot exceed 100")
    .default(10)
});
export type PaginationValidation = z.infer<typeof paginationSchema>;

const birthDateRangeFieldSchema = z
  .string({ error: "date is required" })
  .refine((value) => isBirthDateStringValid(value), "date is not valid");

export const userRangeQuerySchema = paginationSchema
  .extend({
    startDate: birthDateRangeFieldSchema,
    endDate: birthDateRangeFieldSchema
  })
  .refine(
    ({ startDate, endDate }) => new Date(startDate) <= new Date(endDate),
    "start date must be before or equal to end date"
  );
export type UserRangeQueryValidation = z.infer<typeof userRangeQuerySchema>;

export const userBirthdayQuerySchema = paginationSchema
  .extend({
    month: userMonthSchema,
    day: userDaySchema.optional()
  })
  .refine(
    ({ month, day }) => day === undefined || isValidBirthdayMonthDay(month, day),
    "day is not valid for the selected month"
  );
export type UserBirthdayQueryValidation = z.infer<typeof userBirthdayQuerySchema>;
