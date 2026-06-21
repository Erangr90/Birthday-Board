import path from "path";
import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";


const LOG_DIR = path.join(process.cwd(), "logs");


const LOG_RETENTION = "14d";
const MAX_FILE_SIZE = "20m";


const readableFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, category, stack, ...rest } = info;

    const label = category ? `${category} ${message}` : `${message}`;


    const details = Object.entries(rest)
      .filter(([key]) => key !== "action")
      .map(([key, value]) => {
        const text =
          value && typeof value === "object"
            ? JSON.stringify(value)
            : String(value);
        return `${key}=${text}`;
      })
      .join(" ");

    const detailsText = details ? ` | ${details}` : "";
    const stackText = stack ? `\n${stack}` : "";

    return `${timestamp} [${level.toUpperCase()}] ${label}${detailsText}${stackText}`;
  })
);


export const logger = winston.createLogger({
  level: "info",
  format: readableFormat,
  transports: [

    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: "analytics-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: MAX_FILE_SIZE,
      maxFiles: LOG_RETENTION
    }),

    new DailyRotateFile({
      level: "error",
      dirname: LOG_DIR,
      filename: "error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: MAX_FILE_SIZE,
      maxFiles: LOG_RETENTION
    })
  ]
});

export default logger;
