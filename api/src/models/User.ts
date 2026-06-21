import mongoose from "mongoose";
import bcrypt from "bcrypt";
import IUser from "../interfaces/IUser";
import {
  USER_NAME_PATTERN,
  USER_NAME_PATTERN_MESSAGE,
  USER_AGE_MESSAGE
} from "../validations/user";
import { isUserAgeValid } from "../utils/age";
import {
  getBirthdayMonthDay,
  getDaysUntilNextBirthday,
  isBirthDateCalendarValid,
  isValidBirthdayDay,
  isValidBirthdayMonth
} from "../utils/birthdayDate";


export enum Role {
  Admin = "ADMIN",
  User = "USER"
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, "MongoDB validation: User's name is too short"],
    maxlength: [50, "MongoDB validation: User's name is too long"],
    match: [USER_NAME_PATTERN, `MongoDB validation: ${USER_NAME_PATTERN_MESSAGE}`]
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      "MongoDB validation: User's email is not valid"
    ]
  },
  password: {
    type: String,
    required: true
  },
  birthDate: {
    type: Date,
    required: true,
    validate: [
      {
        validator: (value: Date) => value <= new Date(),
        message: "MongoDB validation: birth date cannot be in the future"
      },
      {
        validator: (value: Date) => isBirthDateCalendarValid(value),
        message: "MongoDB validation: birth date is not valid"
      },
      {
        validator: (value: Date) => isUserAgeValid(value),
        message: `MongoDB validation: ${USER_AGE_MESSAGE}`
      }
    ]
  },
  month: {
    type: Number,
    required: true,
    min: [1, "MongoDB validation: birth month must be between 1 and 12"],
    max: [12, "MongoDB validation: birth month must be between 1 and 12"]
  },
  day: {
    type: Number,
    required: true,
    min: [1, "MongoDB validation: birth day must be between 1 and 31"],
    max: [31, "MongoDB validation: birth day must be between 1 and 31"]
  },
  daysUntilNextBirthday: {
    type: Number,
    required: true,
    min: [0, "MongoDB validation: days until next birthday must be at least 0"],
    max: [366, "MongoDB validation: days until next birthday cannot exceed 366"]
  },
  role: {
    type: String,
    enum: Object.values(Role),
    default: Role.User,
    required: true
  }
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ month: 1, day: 1 });
userSchema.index({ birthDate: 1 });
userSchema.index({ daysUntilNextBirthday: 1, name: 1 });

userSchema.pre("validate", function (this: mongoose.HydratedDocument<IUser>) {
  if (!this.birthDate) {
    return;
  }

  if (!isBirthDateCalendarValid(this.birthDate)) {
    this.invalidate("birthDate", "MongoDB validation: birth date is not valid");
    return;
  }

  const { month, day } = getBirthdayMonthDay(this.birthDate);
  this.month = month;
  this.day = day;

  if (!isValidBirthdayMonth(month)) {
    this.invalidate("month", "MongoDB validation: birth month must be between 1 and 12");
  }

  if (!isValidBirthdayDay(day)) {
    this.invalidate("day", "MongoDB validation: birth day must be between 1 and 31");
  }

  this.daysUntilNextBirthday = getDaysUntilNextBirthday(month, day);
});


userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};


userSchema.pre("save", async function (this: mongoose.HydratedDocument<IUser>) {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model<IUser>("User", userSchema);

export default User;
