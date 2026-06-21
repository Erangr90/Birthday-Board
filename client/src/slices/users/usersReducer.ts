import { createSlice } from "@reduxjs/toolkit"
import type {
  AdminUser,
  BirthdayUser,
  Pagination,
  RangeUser,
} from "../../types/user"
import type { ServerError } from "../../types/errors"
import {
  fetchAllUsers,
  fetchAllUsersAdmin,
  fetchTodayUsers,
  fetchUsersByBirthday,
  fetchUsersByDateRange,
} from "./userActions"
import { logout } from "../auth/authActions"

export interface UsersState {
  todayUsers: BirthdayUser[]
  todayPagination?: Pagination
  todayLoading: boolean
  todayError?: ServerError
  allUsers: BirthdayUser[]
  allPagination?: Pagination
  allLoading: boolean
  allError?: ServerError
  rangeUsers: RangeUser[]
  rangePagination?: Pagination
  rangeLoading: boolean
  rangeError?: ServerError
  rangeSearched: boolean
  adminUsers: AdminUser[]
  adminPagination?: Pagination
  adminLoading: boolean
  adminError?: ServerError
}

const initialState: UsersState = {
  todayUsers: [],
  todayPagination: undefined,
  todayLoading: false,
  todayError: undefined,
  allUsers: [],
  allPagination: undefined,
  allLoading: false,
  allError: undefined,
  rangeUsers: [],
  rangePagination: undefined,
  rangeLoading: false,
  rangeError: undefined,
  rangeSearched: false,
  adminUsers: [],
  adminPagination: undefined,
  adminLoading: false,
  adminError: undefined,
}

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTodayUsers.pending, (state) => {
      state.todayLoading = true
      state.todayError = undefined
    })
    builder.addCase(fetchTodayUsers.fulfilled, (state, action) => {
      state.todayLoading = false
      state.todayError = undefined
      state.todayUsers = action.payload.users
      state.todayPagination = action.payload.pagination
    })
    builder.addCase(fetchTodayUsers.rejected, (state, action) => {
      state.todayLoading = false
      state.todayError = action.payload || {
        message: "Failed to load today's birthdays",
      }
      state.todayUsers = []
      state.todayPagination = undefined
    })

    builder.addCase(fetchAllUsers.pending, (state) => {
      state.allLoading = true
      state.allError = undefined
    })
    builder.addCase(fetchAllUsers.fulfilled, (state, action) => {
      state.allLoading = false
      state.allError = undefined
      state.allUsers = action.payload.users
      state.allPagination = action.payload.pagination
    })
    builder.addCase(fetchAllUsers.rejected, (state, action) => {
      state.allLoading = false
      state.allError = action.payload || { message: "Failed to load users" }
      state.allUsers = []
      state.allPagination = undefined
    })

    builder.addCase(fetchUsersByDateRange.pending, (state) => {
      state.rangeLoading = true
      state.rangeError = undefined
    })
    builder.addCase(fetchUsersByDateRange.fulfilled, (state, action) => {
      state.rangeLoading = false
      state.rangeError = undefined
      state.rangeUsers = action.payload.users
      state.rangePagination = action.payload.pagination
      state.rangeSearched = true
    })
    builder.addCase(fetchUsersByDateRange.rejected, (state, action) => {
      state.rangeLoading = false
      state.rangeError = action.payload || {
        message: "Failed to search users by date range",
      }
      state.rangeUsers = []
      state.rangePagination = undefined
      state.rangeSearched = true
    })

    builder.addCase(fetchUsersByBirthday.pending, (state) => {
      state.rangeLoading = true
      state.rangeError = undefined
    })
    builder.addCase(fetchUsersByBirthday.fulfilled, (state, action) => {
      state.rangeLoading = false
      state.rangeError = undefined
      state.rangeUsers = action.payload.users
      state.rangePagination = action.payload.pagination
      state.rangeSearched = true
    })
    builder.addCase(fetchUsersByBirthday.rejected, (state, action) => {
      state.rangeLoading = false
      state.rangeError = action.payload || {
        message: "Failed to search users by birthday",
      }
      state.rangeUsers = []
      state.rangePagination = undefined
      state.rangeSearched = true
    })

    builder.addCase(fetchAllUsersAdmin.pending, (state) => {
      state.adminLoading = true
      state.adminError = undefined
    })
    builder.addCase(fetchAllUsersAdmin.fulfilled, (state, action) => {
      state.adminLoading = false
      state.adminError = undefined
      state.adminUsers = action.payload.users
      state.adminPagination = action.payload.pagination
    })
    builder.addCase(fetchAllUsersAdmin.rejected, (state, action) => {
      state.adminLoading = false
      state.adminError = action.payload || { message: "Failed to load users" }
      state.adminUsers = []
      state.adminPagination = undefined
    })

    // Ensure all user-related in-memory data is removed on sign-out.
    builder.addCase(logout.fulfilled, () => initialState)
    builder.addCase(logout.rejected, () => initialState)
  },
})

export default usersSlice.reducer
