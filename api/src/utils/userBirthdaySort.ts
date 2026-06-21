import User from "../models/User";
import { getDaysUntilNextBirthday } from "./birthdayDate";
import IUser from "../interfaces/IUser";
import { logDbOperation } from "./analytics";

export function getUserDaysUntilNextBirthday(
  month: number,
  day: number,
  referenceDate: Date = new Date()
): number {
  return getDaysUntilNextBirthday(month, day, referenceDate);
}

export function setUserBirthdaySortField(
  user: IUser,
  referenceDate: Date = new Date()
): void {
  user.daysUntilNextBirthday = getUserDaysUntilNextBirthday(
    user.month,
    user.day,
    referenceDate
  );
}

export async function rebuildAllUsersBirthdaySort(
  referenceDate: Date = new Date()
): Promise<void> {
  const users = await User.find().select("_id month day");

  if (users.length === 0) {
    logDbOperation("birthday_sort_rebuild", "success", { count: 0 });
    return;
  }

  await User.bulkWrite(
    users.map((user) => ({
      updateOne: {
        filter: { _id: user._id },
        update: {
          $set: {
            daysUntilNextBirthday: getUserDaysUntilNextBirthday(
              user.month,
              user.day,
              referenceDate
            )
          }
        }
      }
    }))
  );

  logDbOperation("birthday_sort_rebuild", "success", { count: users.length });
}
