import { Document } from "mongoose"

export interface IEmailSuspension extends Document {
  email: string
  suspendedAt: Date
  endsAt: Date | null
}

export default IEmailSuspension
