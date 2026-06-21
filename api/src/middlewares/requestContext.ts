import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import AuthRequest from "../types/authRequest";
import { logHttpAccess } from "../utils/analytics";


export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = crypto.randomUUID();
  (req as AuthRequest).requestId = requestId;

  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1e6;

    logHttpAccess({
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      userId: (req as AuthRequest).user?.id ?? "anonymous",
      durationMs: Math.round(durationMs)
    });
  });

  next();
}
