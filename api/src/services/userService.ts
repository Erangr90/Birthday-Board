import User from "../models/User";
import IUser, { Role } from "../interfaces/IUser";
import HttpError from "../utils/httpError";
import { getRedisClient } from "../config/redis";
import { logDbOperation, logRedisOperation } from "../utils/analytics";
import { getMonthDayInTimezone } from "../utils/birthdayDate";
import {
  addTodayUserToCache,
  getTodayUsersCacheKey,
  removeTodayUserFromCache
} from "../utils/todayUsersCache";
import { suspendEmail } from "../utils/emailSuspension";
import { SuspendDuration } from "../validations/user";


export type TodayUserData = {
  name: string;
  email: string;
  birthDate: Date;
  daysUntilNextBirthday: number;
};

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  birthDate: string;
};

type UpdateCurrentUserInput = {
  name?: string;
  email?: string;
  password?: string;
  birthDate?: string;
};


export async function getTodayUsers(
  referenceDate: Date
): Promise<{ users: TodayUserData[]; source: string }> {
  let users: TodayUserData[] = [];
  let source = "mongodb";

  const redisClient = getRedisClient();

  if (redisClient?.isReady) {
    try {
      const cacheKey = getTodayUsersCacheKey(referenceDate);
      const cachedUsers = await redisClient.hGetAll(cacheKey);
      const cachedValues = Object.values(cachedUsers);

      if (cachedValues.length > 0) {
        users = cachedValues.map((value) => {
          const parsed = JSON.parse(String(value));
          return {
            name: parsed.name,
            email: parsed.email,
            birthDate: new Date(parsed.birthDate),
            daysUntilNextBirthday: 0
          };
        });
        source = "redis";
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Unknown Redis read error";
      logRedisOperation("today_users_read", "failure", {
        errorMessage: message
      });
    }
  }

  if (users.length === 0) {
    const { month, day } = getMonthDayInTimezone(referenceDate);
    const todayUsers = await User.find({ month, day }).select("-password");

    users = todayUsers.map((user) => ({
      name: user.name,
      email: user.email,
      birthDate: user.birthDate,
      daysUntilNextBirthday: user.daysUntilNextBirthday
    }));
  }

  users.sort((a, b) => a.name.localeCompare(b.name));

  return { users, source };
}

export async function getUsersExcludingToday(
  page: number,
  limit: number,
  referenceDate: Date
): Promise<{ users: IUser[]; total: number }> {
  const skip = (page - 1) * limit;
  const { month, day } = getMonthDayInTimezone(referenceDate);
  const excludeTodayFilter = { $nor: [{ month, day }] };

  const [users, total] = await Promise.all([
    User.find(excludeTodayFilter)
      .select("-password")
      .sort({ daysUntilNextBirthday: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(excludeTodayFilter)
  ]);

  return { users, total };
}

export async function getAdminUsers(
  page: number,
  limit: number
): Promise<{ users: IUser[]; total: number }> {
  const skip = (page - 1) * limit;
  const usersOnlyFilter = { role: Role.User };

  const [users, total] = await Promise.all([
    User.find(usersOnlyFilter)
      .select("-password")
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(usersOnlyFilter)
  ]);

  return { users, total };
}

export async function getUsersByBirthDateRange(
  startDate: string,
  endDate: string,
  page: number,
  limit: number
): Promise<{ users: IUser[]; total: number }> {
  const skip = (page - 1) * limit;
  const dateFilter = {
    birthDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };

  const [users, total] = await Promise.all([
    User.find(dateFilter)
      .select("-password")
      .sort({ birthDate: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(dateFilter)
  ]);

  return { users, total };
}

export async function getUsersByBirthday(
  month: number,
  day: number | undefined,
  page: number,
  limit: number
): Promise<{ users: IUser[]; total: number }> {
  const skip = (page - 1) * limit;
  const filter = day === undefined ? { month } : { month, day };

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ day: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter)
  ]);

  return { users, total };
}

export async function createUser(data: CreateUserInput): Promise<IUser> {
  const userExists = await User.findOne({ email: data.email });

  if (userExists) {
    throw new HttpError(400, "Email already in use");
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    birthDate: new Date(data.birthDate)
  });

  if (!user) {
    throw new HttpError(500, "Database error");
  }

  logDbOperation("user_create", "success", { userId: user.id });

  await addTodayUserToCache(user);

  return user;
}

export async function updateCurrentUser(
  userId: string,
  updates: UpdateCurrentUserInput
): Promise<void> {
  const user = await User.findById(userId);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  const previousBirthDate = user.birthDate;

  if (updates.email && updates.email !== user.email) {
    if (await User.exists({ email: updates.email, _id: { $ne: user._id } })) {
      throw new HttpError(400, "Email already in use");
    }
    user.email = updates.email;
  }

  if (updates.name) {
    user.name = updates.name;
  }

  if (updates.password) {
    user.password = updates.password;
  }

  if (updates.birthDate) {
    user.birthDate = new Date(updates.birthDate);
  }

  await user.save();

  logDbOperation("user_update", "success", { userId: user._id.toString() });

  if (updates.birthDate) {
    await removeTodayUserFromCache(user._id.toString(), previousBirthDate);
  }

  await addTodayUserToCache(user);
}

export async function deleteUserById(
  id: string,
  suspendDuration: SuspendDuration
): Promise<void> {
  const user = await User.findById(id);

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  await suspendEmail(user.email, suspendDuration);
  await removeTodayUserFromCache(user.id, user.birthDate);
  await User.findByIdAndDelete(id);

  logDbOperation("user_delete", "success", { userId: id });
}
