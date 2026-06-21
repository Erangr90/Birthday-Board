import jwt from "jsonwebtoken"
import crypto from "crypto"
import { Response } from "express"
import dotenv from "dotenv"
dotenv.config({ quiet: true })


if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be set in environment variables and be at least 32 characters long"
  )
}

const JWT_SECRET = process.env.JWT_SECRET
const JWT_ALGORITHM = "HS256" 
const ACCESS_TOKEN_EXPIRY = "15m"
const REFRESH_TOKEN_EXPIRY = "30d" 
const ACCESS_TOKEN_MAX_AGE_MS = 15 * 60 * 1000
const REFRESH_TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000


export const REFRESH_COOKIE_PATH = "/api/auth/refresh"

export interface TokenPayload {
  userId: string
  type?: "access" | "refresh"
  jti?: string
  sessionStart?: number
  exp?: number
  iat?: number
}

const isProduction = () => process.env.NODE_ENV === "production"

const setAccessTokenCookie = (res: Response, accessToken: string) => {
  res.cookie("jwt", accessToken, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_MAX_AGE_MS,
  })
}


const generateToken = async (
  res: Response,
  userId: string,
  sessionStart: number = Date.now()
) => {
  const accessJti = crypto.randomUUID()
  const refreshJti = crypto.randomUUID()

  const accessToken = jwt.sign(
    { userId, type: "access", jti: accessJti, sessionStart },
    JWT_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  )

  const refreshToken = jwt.sign(
    { userId, type: "refresh", jti: refreshJti, sessionStart },
    JWT_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }
  )

  setAccessTokenCookie(res, accessToken)

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "strict",
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: REFRESH_COOKIE_PATH, 
  })

  return { accessJti, refreshJti }
}


export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM], // Explicitly specify allowed algorithms
    }) as TokenPayload

    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired")
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid token")
    }
    throw new Error("Token verification failed")
  }
}

export default generateToken
