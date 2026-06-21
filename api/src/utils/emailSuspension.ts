import EmailSuspension from "../models/EmailSuspension";
import { SuspendDuration } from "../validations/user";

export function getSuspensionEndDate(
  duration: SuspendDuration,
  from: Date = new Date()
): Date | null {
  const end = new Date(from);

  switch (duration) {
    case "two_weeks":
      end.setDate(end.getDate() + 14);
      return end;
    case "one_month":
      end.setMonth(end.getMonth() + 1);
      return end;
    case "half_year":
      end.setMonth(end.getMonth() + 6);
      return end;
    case "one_year":
      end.setFullYear(end.getFullYear() + 1);
      return end;
    case "life":
      return null;
    default:
      return null;
  }
}

export async function suspendEmail(
  email: string,
  duration: SuspendDuration
): Promise<void> {
  if (duration === "none") {
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const suspendedAt = new Date();
  const endsAt = getSuspensionEndDate(duration, suspendedAt);

  await EmailSuspension.findOneAndUpdate(
    { email: normalizedEmail },
    { email: normalizedEmail, suspendedAt, endsAt },
    { upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
}

export async function isEmailSuspended(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const suspension = await EmailSuspension.findOne({ email: normalizedEmail });

  if (!suspension) {
    return false;
  }

  if (suspension.endsAt === null) {
    return true;
  }

  return suspension.endsAt.getTime() > Date.now();
}
