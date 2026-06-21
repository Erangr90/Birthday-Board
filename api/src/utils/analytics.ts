import logger from "../config/logger";



type Outcome = "success" | "failure";


type LogContext = {
  userId?: string;
  requestId?: string;
  durationMs?: number;
  errorMessage?: string;
  [key: string]: unknown;
};

function write(
  category: string,
  action: string,
  outcome: Outcome,
  context: LogContext = {}
): void {
  const level = outcome === "failure" ? "error" : "info";
  logger.log(level, action, { category, action, outcome, ...context });
}

export function logDbOperation(
  action: string,
  outcome: Outcome,
  context?: LogContext
): void {
  write("db", action, outcome, context);
}

export function logRedisOperation(
  action: string,
  outcome: Outcome,
  context?: LogContext
): void {
  write("redis", action, outcome, context);
}

export function logCronRun(
  job: string,
  outcome: Outcome,
  context?: LogContext
): void {
  write("cron", job, outcome, context);
}

export function logEmailOperation(
  action: string,
  outcome: Outcome,
  context?: LogContext
): void {
  write("email", action, outcome, context);
}


export function logAuthEvent(
  event: "register" | "login" | "logout",
  context: {
    userId?: string;
    email?: string;
    requestId?: string;
    activeMs?: number;
  }
): void {
  write("auth", event, "success", context);
}


export function logHttpAccess(context: {
  requestId?: string;
  method: string;
  path: string;
  statusCode: number;
  userId?: string;
  durationMs?: number;
}): void {
  logger.info("request", {
    category: "http",
    action: "request",
    outcome: context.statusCode >= 400 ? "failure" : "success",
    ...context
  });
}
