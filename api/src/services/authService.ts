import crypto from "crypto";
import bcrypt from "bcrypt";
import User from "../models/User";
import IUser from "../interfaces/IUser";
import HttpError from "../utils/httpError";
import { isEmailSuspended } from "../utils/emailSuspension";
import { sendVerificationCodeEmailWithRetry } from "../utils/brevoEmail";
import { addTodayUserToCache } from "../utils/todayUsersCache";
import { logEmailOperation } from "../utils/analytics";

type RegistrationDetails = {
  name: string;
  email: string;
  password: string;
  birthDate: string;
};


const DUMMY_PASSWORD_HASH = bcrypt.hashSync("invalid-password-placeholder", 12);

function generateSixDigitCode(): string {
  return String(crypto.randomInt(100000, 1000000));
}


export async function requestRegistrationCode(
  data: RegistrationDetails
): Promise<string | null> {
  if (await isEmailSuspended(data.email)) {
    return null;
  }

  if (await User.findOne({ email: data.email })) {
    return null;
  }

  const code = generateSixDigitCode();

  sendVerificationCodeEmailWithRetry(data.email, data.name, code).catch(
    (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Unknown email error";
      logEmailOperation("verification_email_background", "failure", {
        errorMessage: message
      });
    }
  );

  return code;
}


export async function registerUser(data: RegistrationDetails): Promise<IUser> {
  if (await User.findOne({ email: data.email })) {
    throw new HttpError(400, "Email is already registered");
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    birthDate: new Date(data.birthDate)
  });

  if (!user) {
    throw new HttpError(500, "Database error");
  }

  await addTodayUserToCache(user);

  return user;
}

export async function validateLogin(
  email: string,
  password: string
): Promise<IUser> {
  const user = await User.findOne({ email });


  const hashedPassword = user ? user.password : DUMMY_PASSWORD_HASH;
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);

  if (user && isPasswordValid) {
    return user;
  }

  throw new HttpError(400, "Email or password is not valid");
}
