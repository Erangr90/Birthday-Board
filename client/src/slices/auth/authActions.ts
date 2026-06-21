import { createAsyncThunk } from "@reduxjs/toolkit"
import type {
  RegisterForm,
  User,
  LoginForm,
  UpdateProfilePayload,
} from "../../types/auth"
import type { ServerError } from "../../types/errors"
import type { RootState } from "../../store"
import axiosClient, { refreshSession } from "../../utils/axiosClient"
import { AxiosError } from "axios"

export const AUTH_SESSION_HINT_KEY = "auth-session-hint"


const buildBirthDate = (
  birthYear: string,
  birthMonth: string,
  birthDay: string
) => `${birthYear}-${birthMonth.padStart(2, "0")}-${birthDay.padStart(2, "0")}`


export const sendRegistrationCode = createAsyncThunk<
  { code: string | null }, // Return type
  RegisterForm, // Argument type
  { rejectValue: ServerError } // Reject value type
>("auth/sendRegistrationCode", async (userData, { rejectWithValue }) => {
  try {
    const { confirmPassword, birthYear, birthMonth, birthDay, ...rest } = userData
    const birthDate = buildBirthDate(birthYear, birthMonth, birthDay)
    const { data } = await axiosClient.post("/auth/send-code", { ...rest, birthDate })
    return data
  } catch (err) {
    const error = err as AxiosError<ServerError>
    if (error.response?.data) {
      return rejectWithValue(error.response.data)
    }
    return rejectWithValue({
      message:
        error.message ||
        "Could not reach the server. Make sure the API is running.",
    })
  }
})


export const registerUser = createAsyncThunk<
  User, // Return type (User or whatever the API returns)
  RegisterForm, // Argument type
  { rejectValue: ServerError } // Reject value type
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const { confirmPassword, birthYear, birthMonth, birthDay, ...rest } = userData
    const birthDate = buildBirthDate(birthYear, birthMonth, birthDay)
    const { data } = await axiosClient.post("/auth", { ...rest, birthDate })
    window.localStorage.setItem(AUTH_SESSION_HINT_KEY, "1")
    return data
  } catch (err) {
    const error = err as AxiosError<ServerError>
    if (error.response?.data) {
      return rejectWithValue(error.response.data)
    }
    return rejectWithValue({
      message:
        error.message ||
        "Could not reach the server. Make sure the API is running.",
    })
  }
})

// Login user
export const loginUser = createAsyncThunk<
  User, // Return type (User or whatever the API returns)
  LoginForm, // Argument type
  { rejectValue: ServerError } // Reject value type
>("auth/loginUser", async (userData, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.post("/auth/login", userData)
    window.localStorage.setItem(AUTH_SESSION_HINT_KEY, "1")
    return data
  } catch (err) {
    const error = err as AxiosError<ServerError>
    if (error.response?.data) {
      return rejectWithValue(error.response.data)
    }
    return rejectWithValue({
      message:
        error.message ||
        "Could not reach the server. Make sure the API is running.",
    })
  }
})

// Update the current user's own details, then refresh the stored user
export const updateProfile = createAsyncThunk<
  User, // Return type
  UpdateProfilePayload, // Argument type
  { state: RootState; rejectValue: ServerError } // Thunk config
>("auth/updateProfile", async (payload, { rejectWithValue, getState }) => {
  try {
    await axiosClient.patch("/users/me", payload)

    const currentUser = getState().auth.user
    if (currentUser) {
      return {
        ...currentUser,
        name: payload.name,
        email: payload.email,
        birthDate: payload.birthDate,
      }
    }

   
    const { data } = await axiosClient.get("/auth/me")
    return data
  } catch (err) {
    const error = err as AxiosError<ServerError>
    if (error.response?.data) {
      return rejectWithValue(error.response.data)
    }
    return rejectWithValue({
      message:
        error.message ||
        "Could not reach the server. Make sure the API is running.",
    })
  }
})

// Log the current user out and clear the auth cookies
export const logout = createAsyncThunk<
  void, // Return type
  void, // Argument type
  { rejectValue: ServerError } // Reject value type
>("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await axiosClient.post("/auth/logout")
  } catch (err) {
    const error = err as AxiosError<ServerError>
    if (error.response?.data) {
      return rejectWithValue(error.response.data)
    }
    return rejectWithValue({
      message:
        error.message ||
        "Could not reach the server. Make sure the API is running.",
    })
  } finally {
    window.localStorage.clear()
    window.sessionStorage.clear()
  }
})

// Restore the logged in user from the auth cookie on app load
export const fetchCurrentUser = createAsyncThunk<
  User, // Return type
  void, // Argument type
  { rejectValue: ServerError } // Reject value type
>("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    await refreshSession()
    const { data } = await axiosClient.get("/auth/me")
    window.localStorage.setItem(AUTH_SESSION_HINT_KEY, "1")
    return data
  } catch (err) {
    const error = err as AxiosError<ServerError>
    if (error.response?.status === 401) {
      window.localStorage.removeItem(AUTH_SESSION_HINT_KEY)
    }
    if (error.response?.data) {
      return rejectWithValue(error.response.data)
    }
    return rejectWithValue({
      message:
        error.message ||
        "Could not reach the server. Make sure the API is running.",
    })
  }
})
