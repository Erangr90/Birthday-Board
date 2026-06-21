import cron from "node-cron";
import { APP_TIMEZONE } from "../utils/birthdayDate";
import { cacheTodayUsersFromDatabase } from "../utils/todayUsersCache";
import { logCronRun } from "../utils/analytics";

const TODAY_USERS_CRON = "3 0 * * *";


export const runTodayUsersCacheJob = async (
  trigger: "cron" | "startup"
): Promise<void> => {
  const startTime = Date.now();

  try {
    await cacheTodayUsersFromDatabase();
    logCronRun("today_users_cache", "success", {
      trigger,
      durationMs: Date.now() - startTime
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown cron error";
    logCronRun("today_users_cache", "failure", {
      trigger,
      durationMs: Date.now() - startTime,
      errorMessage: message
    });
  }
};

const startTodayUsersCron = () => {
  cron.schedule(TODAY_USERS_CRON, () => runTodayUsersCacheJob("cron"), {
    timezone: APP_TIMEZONE
  });
};

export default startTodayUsersCron;
