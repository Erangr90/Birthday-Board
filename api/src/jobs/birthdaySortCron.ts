import cron from "node-cron";
import { APP_TIMEZONE } from "../utils/birthdayDate";
import { rebuildAllUsersBirthdaySort } from "../utils/userBirthdaySort";
import { logCronRun } from "../utils/analytics";

const BIRTHDAY_SORT_CRON = "5 0 * * *";

const startBirthdaySortCron = () => {
  cron.schedule(
    BIRTHDAY_SORT_CRON,
    async () => {
      const startTime = Date.now();

      try {
        await rebuildAllUsersBirthdaySort();
        logCronRun("birthday_sort_rebuild", "success", {
          durationMs: Date.now() - startTime
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Unknown cron error";
        logCronRun("birthday_sort_rebuild", "failure", {
          durationMs: Date.now() - startTime,
          errorMessage: message
        });
      }
    },
    { timezone: APP_TIMEZONE }
  );
};

export default startBirthdaySortCron;
