import { Request, Response, NextFunction } from "express"
import HttpError from "../utils/httpError"
import AuthRequest from "../types/authRequest"
import logger from "../config/logger"

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const explicitStatus = err instanceof HttpError ? err.statusCode : undefined
  const statusCode =
    explicitStatus ?? (res.statusCode === 200 ? 500 : res.statusCode)
  const message = err.message || "Something went wrong"



  const authReq = req as AuthRequest
  logger.error("request_error", {
    category: "http",
    action: "error",
    outcome: "failure",
    method: req.method,
    path: req.originalUrl,
    statusCode,
    userId: authReq.user?.id ?? "anonymous",
    requestId: authReq.requestId,
    errorMessage: message
  })

  res.status(statusCode).json({
    message: message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  })
}

export { notFound, errorHandler }
