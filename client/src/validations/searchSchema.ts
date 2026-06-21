import { z } from "zod"



export const searchModeSchema = z.enum(["range", "day", "month"])


const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date")


const monthSchema = z.coerce
  .number()
  .int()
  .min(1, "Please choose a month")
  .max(12, "Please choose a month")

const daySchema = z.coerce
  .number()
  .int()
  .min(1, "Please choose a day")
  .max(31, "Please choose a day")

export const rangeSearchSchema = z
  .object({
    startDate: isoDateSchema,
    endDate: isoDateSchema,
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "The start date must be before or equal to the end date.",
    path: ["endDate"],
  })

export const daySearchSchema = z.object({
  month: monthSchema,
  day: daySchema,
})

export const monthSearchSchema = z.object({
  month: monthSchema,
})
