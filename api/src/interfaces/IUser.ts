import { Document } from "mongoose"

// Need to change also in User.ts model
export enum Role {
  Admin = "ADMIN",
  User = "USER"
}

export interface IUser extends Document {
  id: string
  name: string
  email: string
  password: string
  birthDate: Date
  month: number
  day: number
  daysUntilNextBirthday: number
  role: Role
  matchPassword: (enteredPassword: string) => Promise<boolean>
}

export default IUser
