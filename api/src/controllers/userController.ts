import { Response, Request } from "express";
import asyncHandler from "../middlewares/asyncHandler";
import IUser from "../interfaces/IUser";
import AuthRequest from "../types/authRequest";
import {
  createUserSchema,
  deleteUserSchema,
  paginationSchema,
  updateCurrentUserSchema,
  userBirthdayQuerySchema,
  userIdSchema,
  userRangeQuerySchema
} from "../validations/user";
import { getAge } from "../utils/age";
import {
  formatBirthDateDisplay,
  formatBirthDateMonthDayDisplay
} from "../utils/birthdayDate";
import * as userService from "../services/userService";
import { TodayUserData } from "../services/userService";

type TodayUserItem = {
  name: string;
  email: string;
  birthDate: string;
};

type ListedUserItem = {
  name: string;
  email: string;
  birthDate: string;
  userAge: number;
  daysUntilNextBirthday: number;
};

type AdminUserItem = TodayUserItem & {
  id: string;
};

const formatUserResponse = (user: IUser): TodayUserItem => ({
  name: user.name,
  email: user.email,
  birthDate: formatBirthDateDisplay(user.birthDate)
});

const formatListedUserResponse = (
  user: IUser,
  referenceDate: Date = new Date()
): ListedUserItem => ({
  name: user.name,
  email: user.email,
  birthDate: formatBirthDateMonthDayDisplay(user.birthDate),
  userAge: getAge(user.birthDate, referenceDate),
  daysUntilNextBirthday: user.daysUntilNextBirthday
});

const formatTodayUserResponse = (
  user: TodayUserData,
  referenceDate: Date = new Date()
): ListedUserItem => ({
  name: user.name,
  email: user.email,
  birthDate: formatBirthDateMonthDayDisplay(user.birthDate),
  userAge: getAge(user.birthDate, referenceDate),
  daysUntilNextBirthday: user.daysUntilNextBirthday
});

const formatAdminUserResponse = (user: IUser): AdminUserItem => ({
  id: user.id,
  ...formatUserResponse(user)
});

const buildPagination = (page: number, limit: number, total: number) => {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

export const getTodayUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationResult = paginationSchema.safeParse(req.query);

    if (!paginationResult.success) {
      const errors = [];
      for (const error of paginationResult.error.issues) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }

    const { page, limit } = paginationResult.data;
    const referenceDate = new Date();
    const { users } = await userService.getTodayUsers(referenceDate);

    const total = users.length;
    const skip = (page - 1) * limit;
    const paginatedUsers = users.slice(skip, skip + limit);

    res.json({
      users: paginatedUsers.map((user) =>
        formatTodayUserResponse(user, referenceDate)
      ),
      pagination: buildPagination(page, limit, total)
    });
  }
);

export const getAllUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationResult = paginationSchema.safeParse(req.query);

    if (!paginationResult.success) {
      const errors = [];
      for (const error of paginationResult.error.issues) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }

    const { page, limit } = paginationResult.data;
    const referenceDate = new Date();
    const { users, total } = await userService.getUsersExcludingToday(
      page,
      limit,
      referenceDate
    );

    res.json({
      users: users.map((user) => formatListedUserResponse(user, referenceDate)),
      pagination: buildPagination(page, limit, total)
    });
  }
);

export const getAllUsersAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const paginationResult = paginationSchema.safeParse(req.query);

    if (!paginationResult.success) {
      const errors = [];
      for (const error of paginationResult.error.issues) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }

    const { page, limit } = paginationResult.data;
    const { users, total } = await userService.getAdminUsers(page, limit);

    res.json({
      users: users.map(formatAdminUserResponse),
      pagination: buildPagination(page, limit, total)
    });
  }
);

export const getUsersByBirthDateRange = asyncHandler(
  async (req: Request, res: Response) => {
    const queryResult = userRangeQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      const errors = [];
      for (const error of queryResult.error.issues) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }

    const { startDate, endDate, page, limit } = queryResult.data;
    const { users, total } = await userService.getUsersByBirthDateRange(
      startDate,
      endDate,
      page,
      limit
    );

    res.json({
      users: users.map(formatUserResponse),
      range: {
        startDate,
        endDate
      },
      pagination: buildPagination(page, limit, total)
    });
  }
);

export const getUsersByBirthday = asyncHandler(
  async (req: Request, res: Response) => {
    const queryResult = userBirthdayQuerySchema.safeParse(req.query);

    if (!queryResult.success) {
      const errors = [];
      for (const error of queryResult.error.issues) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }

    const { month, day, page, limit } = queryResult.data;
    const { users, total } = await userService.getUsersByBirthday(
      month,
      day,
      page,
      limit
    );

    res.json({
      users: users.map(formatUserResponse),
      pagination: buildPagination(page, limit, total)
    });
  }
);

export const createUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, email, password, birthDate } = req.body;

    const result = createUserSchema.safeParse({
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

    const user = await userService.createUser(result.data);

    res.status(201).json(formatUserResponse(user));
  }
);

export const updateCurrentUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const currentUser = req.user!;
    const { name, email, password, birthDate } = req.body;

    const payload: {
      name?: string;
      email?: string;
      password?: string;
      birthDate?: string;
    } = {};

    if (name !== undefined) {
      payload.name = String(name).trim();
    }

    if (email !== undefined) {
      payload.email = String(email).trim();
    }

    if (password !== undefined) {
      payload.password = String(password).trim();
    }

    if (birthDate !== undefined) {
      payload.birthDate =
        typeof birthDate === "string" ? birthDate.trim() : String(birthDate);
    }

    const result = updateCurrentUserSchema.safeParse(payload);

    if (!result.success) {
      const errors = [];
      for (const error of result.error.issues) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }

    await userService.updateCurrentUser(String(currentUser._id), result.data);

    res.status(200).send("ok");
  }
);

export const deleteUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const idResult = userIdSchema.safeParse({ id: req.params.id });

    if (!idResult.success) {
      const errors = [];
      for (const error of idResult.error.issues) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }

    const bodyResult = deleteUserSchema.safeParse(req.body ?? {});

    if (!bodyResult.success) {
      const errors = [];
      for (const error of bodyResult.error.issues) {
        errors.push(error.message);
      }
      res.status(400).json({ message: [...errors] });
      return;
    }

    const { id } = idResult.data;
    const { suspendDuration } = bodyResult.data;

    await userService.deleteUserById(id, suspendDuration);

    res.status(200).send("ok");
  }
);
