import { getRedisClient } from "../config/redis";
import User from "../models/User";
import IUser from "../interfaces/IUser";
import { logRedisOperation } from "./analytics";
import {
  getBirthdayMonthDay,
  getMonthDayInTimezone,
  getSecondsUntilEndOfDayInTimezone
} from "./birthdayDate";

export function isUserBirthdayToday(
  birthDate: Date,
  referenceDate: Date = new Date()
): boolean {
  const userBirthday = getBirthdayMonthDay(birthDate);
  const today = getMonthDayInTimezone(referenceDate);

  return userBirthday.month === today.month && userBirthday.day === today.day;
}

export function getTodayUsersCacheKey(referenceDate: Date = new Date()): string {
  const { year, month, day } = getMonthDayInTimezone(referenceDate);

  return `users:today:${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getSecondsUntilEndOfTodayCache(referenceDate: Date = new Date()): number {
  return getSecondsUntilEndOfDayInTimezone(referenceDate);
}

function serializeUserForCache(user: IUser): string {
  return JSON.stringify({
    name: user.name,
    email: user.email,
    birthDate: user.birthDate,
    month: user.month,
    day: user.day,
    role: user.role
  });
}

export async function cacheTodayUsersFromDatabase(
  referenceDate: Date = new Date()
): Promise<void> {
  const { month, day } = getMonthDayInTimezone(referenceDate);
  const redisClient = getRedisClient();

  if (!redisClient?.isReady) {
    logRedisOperation("today_users_cache_rebuild", "failure", {
      errorMessage: "Redis not connected"
    });
    return;
  }

  try {
    const users = await User.find({ month, day }).select("-password");
    const cacheKey = getTodayUsersCacheKey(referenceDate);
    const previousDay = new Date(referenceDate);
    previousDay.setDate(previousDay.getDate() - 1);
    await redisClient.del(getTodayUsersCacheKey(previousDay));

    if (users.length === 0) {
      logRedisOperation("today_users_cache_rebuild", "success", { count: 0 });
      return;
    }

    const entries: Record<string, string> = {};

    for (const user of users) {
      entries[user._id.toString()] = serializeUserForCache(user);
    }

    await redisClient.hSet(cacheKey, entries);
    await redisClient.expire(cacheKey, getSecondsUntilEndOfTodayCache(referenceDate));

    logRedisOperation("today_users_cache_rebuild", "success", {
      count: users.length
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown Redis cache error";
    logRedisOperation("today_users_cache_rebuild", "failure", {
      errorMessage: message
    });
  }
}

export async function removeTodayUserFromCache(
  userId: string,
  birthDate: Date
): Promise<void> {
  if (!isUserBirthdayToday(birthDate)) {
    return;
  }

  const redisClient = getRedisClient();

  if (!redisClient?.isReady) {
    return;
  }

  try {
    const cacheKey = getTodayUsersCacheKey();
    await redisClient.hDel(cacheKey, userId);

    logRedisOperation("today_users_cache_remove", "success", { userId });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown Redis cache error";
    logRedisOperation("today_users_cache_remove", "failure", {
      userId,
      errorMessage: message
    });
  }
}

export async function addTodayUserToCache(user: IUser): Promise<void> {
  if (!isUserBirthdayToday(user.birthDate)) {
    return;
  }

  const redisClient = getRedisClient();

  if (!redisClient?.isReady) {
    return;
  }

  try {
    const cacheKey = getTodayUsersCacheKey();

    await redisClient.hSet(cacheKey, user._id.toString(), serializeUserForCache(user));
    await redisClient.expire(cacheKey, getSecondsUntilEndOfTodayCache());

    logRedisOperation("today_users_cache_add", "success", {
      userId: user._id.toString()
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown Redis cache error";
    logRedisOperation("today_users_cache_add", "failure", {
      userId: user._id.toString(),
      errorMessage: message
    });
  }
}
