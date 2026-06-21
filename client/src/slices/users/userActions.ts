import { createAsyncThunk } from "@reduxjs/toolkit"
import { AxiosError } from "axios"
import type {
  AdminUsersResponse,
  BirthdayUsersResponse,
  FetchUsersByBirthdayParams,
  FetchUsersByRangeParams,
  FetchUsersParams,
  PaginatedUsersResponse,
  RangeUsersResponse,
} from "../../types/user"
import type { ServerError } from "../../types/errors"
import axiosClient from "../../utils/axiosClient"

export const fetchTodayUsers = createAsyncThunk<
  PaginatedUsersResponse,
  FetchUsersParams,
  { rejectValue: ServerError }
>("users/fetchTodayUsers", async (params, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get<PaginatedUsersResponse>(
      "/users/today",
      { params }
    )
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

export const fetchAllUsers = createAsyncThunk<
  PaginatedUsersResponse,
  FetchUsersParams,
  { rejectValue: ServerError }
>("users/fetchAllUsers", async (params, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get<PaginatedUsersResponse>("/users", {
      params,
    })
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

export const fetchUsersByDateRange = createAsyncThunk<
  RangeUsersResponse,
  FetchUsersByRangeParams,
  { rejectValue: ServerError }
>("users/fetchUsersByDateRange", async (params, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get<RangeUsersResponse>("/users/range", {
      params,
    })
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

export const fetchUsersByBirthday = createAsyncThunk<
  BirthdayUsersResponse,
  FetchUsersByBirthdayParams,
  { rejectValue: ServerError }
>("users/fetchUsersByBirthday", async (params, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get<BirthdayUsersResponse>(
      "/users/birthday",
      { params }
    )
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

export const fetchAllUsersAdmin = createAsyncThunk<
  AdminUsersResponse,
  FetchUsersParams,
  { rejectValue: ServerError }
>("users/fetchAllUsersAdmin", async (params, { rejectWithValue }) => {
  try {
    const { data } = await axiosClient.get<AdminUsersResponse>("/users/admin", {
      params,
    })
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

export const deleteUserById = createAsyncThunk<
  string,
  { id: string; suspendDuration: string },
  { rejectValue: ServerError }
>("users/deleteUserById", async ({ id, suspendDuration }, { rejectWithValue }) => {
  try {
    await axiosClient.delete(`/users/${id}`, { data: { suspendDuration } })
    return id
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
