import { Request, Response, NextFunction } from "express"
import AuthRequest from "../types/authRequest"
import { verifyToken } from "../utils/generateToken"
import User, { Role } from "../models/User"
import HttpError from "../utils/httpError"

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.jwt

    if (!token) {
      res.status(401).json({ message: "Not authorized, no token" })
      return
    }

    const decoded = verifyToken(token)

    if (decoded.type !== "access") {
      res.status(401).json({ message: "Invalid token type" })
      return
    }

    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      res.status(401).json({ message: "Not authorized, user not found" })
      return
    }

    ;(req as AuthRequest).user = user
    next()
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      res.status(error.statusCode).json({ message: error.message })
      return
    }

    const message =
      error instanceof Error ? error.message : "Not authorized, token failed"
    res.status(401).json({ message })
  }
}

export const admin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest

  if (!authReq.user || authReq.user.role !== Role.Admin) {
    // 403: the user is authenticated but not allowed to access this resource.
    res.status(403).json({ message: "Not authorized, admin only" })
    return
  }
  next()
}

