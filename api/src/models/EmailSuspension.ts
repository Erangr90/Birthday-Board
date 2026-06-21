import mongoose from "mongoose";
import IEmailSuspension from "../interfaces/IEmailSuspension";

const emailSuspensionSchema = new mongoose.Schema<IEmailSuspension>({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      "MongoDB validation: suspended email is not valid"
    ]
  },
  suspendedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  endsAt: {
    type: Date,
    default: null
  }
});

emailSuspensionSchema.index({ email: 1 }, { unique: true });

const EmailSuspension = mongoose.model<IEmailSuspension>(
  "EmailSuspension",
  emailSuspensionSchema
);

export default EmailSuspension;
