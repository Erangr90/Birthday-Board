import { createClient, RedisClientType } from "redis";
import logger from "./logger";
import { logRedisOperation } from "../utils/analytics";

let redisClient: RedisClientType | null = null;

const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      // Redis is a bonus, so a missing URL is a warning, not a fatal error.
      logger.warn("Redis URL not configured; continuing without cache");
      logRedisOperation("connect", "failure", {
        errorMessage: "REDIS_URL not configured"
      });
      return;
    }

    if (!redisClient) {
      redisClient = createClient({
        url: redisUrl,
        disableOfflineQueue: true,
        socket: {

          connectTimeout: 5000,

          reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
        }
      });

      redisClient.on("error", (error: Error) => {
        logger.error(`Redis error: ${error.message}`);
        logRedisOperation("connection", "failure", {
          errorMessage: error.message
        });
      });

      redisClient.on("ready", () => {
        logger.info("Redis connected");
        logRedisOperation("connect", "success");
      });

      redisClient.on("end", () => {
        logger.warn("Redis connection closed");
        logRedisOperation("disconnected", "failure");
      });
    }

    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown Redis error";
    logger.error(`Redis connection failed: ${message}`);
    logRedisOperation("connect", "failure", { errorMessage: message });
  }
};

const getRedisClient = (): RedisClientType | null => redisClient;

export default connectRedis;
export { getRedisClient };
