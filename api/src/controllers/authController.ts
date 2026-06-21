import { Request, Response } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import AuthRequest from "../types/authRequest";
import generateToken, {
  verifyToken,
  REFRESH_COOKIE_PATH
} from "../utils/generateToken";
import {
  sendCodeSchema,
  loginSchema
} from "../validations/user";
import * as authService from "../services/authService";
import HttpError from "../utils/httpError";
import { logAuthEvent } from "../utils/analytics";


export const sendCode = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, birthDate } = req.body;

  const result = sendCodeSchema.safeParse({
    email: email?.trim() || "",
    password: password?.trim() || "",
    name: name?.trim() || "",
    birthDate:
      typeof birthDate === "string"
        ? birthDate.trim()
        : String(birthDate ?? "")
  });
  if (!result.success) {
    const errors = [];
    for (const error of result.error.issues) {
      errors.push(error.message);
    }
    res.status(400).json({ message: [...errors] });
    return;
  }

  const code = await authService.requestRegistrationCode(result.data);


  res.status(200).json({ code });
});


export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, birthDate } = req.body;

  const result = sendCodeSchema.safeParse({
    email: email?.trim() || "",
    password: password?.trim() || "",
    name: name?.trim() || "",
    birthDate:
      typeof birthDate === "string"
        ? birthDate.trim()
        : String(birthDate ?? "")
  });
  if (!result.success) {
    const errors = [];
    for (const error of result.error.issues) {
      errors.push(error.message);
    }
    res.status(400).json({ message: [...errors] });
    return;
  }

  const user = await authService.registerUser(result.data);

  await generateToken(res, user.id);

  logAuthEvent("register", {
    userId: user.id,
    requestId: (req as AuthRequest).requestId
  });

  res.status(201).json({
    id: user._id,
    name: user.name,
    email: user.email,
    birthDate: user.birthDate,
    month: user.month,
    day: user.day,
    role: user.role
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = loginSchema.safeParse({
    email: email?.trim() || "",
    password: password?.trim() || ""
  });
  if (!result.success) {
    const errors = [];
    for (const error of result.error.issues) {
      errors.push(error.message);
    }
    res.status(400).json({ message: [...errors] });
    return;
  }

  const user = await authService.validateLogin(
    result.data.email,
    result.data.password
  );

  await generateToken(res, user.id);

  logAuthEvent("login", {
    userId: user.id,
    requestId: (req as AuthRequest).requestId
  });

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    birthDate: user.birthDate,
    month: user.month,
    day: user.day,
    role: user.role
  });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user;

  if (!user) {
    res.status(401).json({ message: "Not authorized" });
    return;
  }

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    birthDate: user.birthDate,
    month: user.month,
    day: user.day,
    role: user.role
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = req.cookies?.jwt;
  let userId: string | undefined;
  let sessionStart: number | undefined;

  if (accessToken) {
    try {
      const decoded = verifyToken(accessToken);

      if (decoded.type === "access") {
        userId = decoded.userId;
        sessionStart = decoded.sessionStart;
      }
    } catch {
      
    }
  }

  if (userId) {
    logAuthEvent("logout", {
      userId,
      requestId: (req as AuthRequest).requestId,
      activeMs: sessionStart ? Date.now() - sessionStart : undefined
    });
  }

  res.clearCookie("jwt");
  res.clearCookie("refreshToken", { path: REFRESH_COOKIE_PATH });
  res.status(200).json({ message: "Logged out successfully" });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    res.status(401).json({ message: "Refresh token not provided" });
    return;
  }

  try {
    const decoded = verifyToken(refreshToken);

    if (decoded.type !== "refresh") {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    await generateToken(res, decoded.userId, decoded.sessionStart);

    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      throw error;
    }

    const message =
      error instanceof Error ? error.message : "Invalid refresh token";
    res.status(401).json({ message });
  }
});
