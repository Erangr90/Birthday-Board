import { createSlice } from "@reduxjs/toolkit"
import type { User } from "../../types/auth"
import type { ServerError } from "../../types/errors"
import {
  sendRegistrationCode,
  registerUser,
  loginUser,
  fetchCurrentUser,
  updateProfile,
  logout,
} from "./authActions"

export interface AuthState {
  user: User | undefined
  isLogin: boolean
  loading: boolean
  authChecked: boolean
  error?: ServerError
}

const initialState: AuthState = {
  user: undefined,
  isLogin: false,
  loading: false,
  authChecked: false,
  error: undefined,
}

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    markAuthChecked: (state) => {
      state.authChecked = true
    },
  },
  extraReducers: (builder) => {
    // --- Send registration code (step 1, no account created yet) ---
    builder.addCase(sendRegistrationCode.pending, (state) => {
      state.loading = true
      state.error = undefined
    })
    builder.addCase(sendRegistrationCode.fulfilled, (state) => {
      state.loading = false
      state.error = undefined
    })
    builder.addCase(sendRegistrationCode.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload || { message: "Failed to send code" }
    })
    // --- Register user ---
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.error = undefined
      state.loading = false
      state.user = action.payload
      state.isLogin = true
    })
    builder.addCase(registerUser.rejected, (state, action) => {
      state.error = action.payload || { message: "Register user failed" }
      state.user = undefined
      state.isLogin = false
      state.loading = false
    })
    builder.addCase(registerUser.pending, (state) => {
      state.loading = true
      state.error = undefined
      state.isLogin = false
      state.user = undefined
    })
    // --- Login user ---
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.error = undefined
      state.loading = false
      state.user = action.payload
      state.isLogin = true
    })
    builder.addCase(loginUser.rejected, (state, action) => {
      state.error = action.payload || { message: "Login user failed" }
      state.user = undefined
      state.isLogin = false
      state.loading = false
    })
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true
      state.error = undefined
      state.isLogin = false
      state.user = undefined
    })
    // --- Restore current user on app load ---
    builder.addCase(fetchCurrentUser.fulfilled, (state, action) => {
      state.user = action.payload
      state.isLogin = true
      state.authChecked = true
    })
    builder.addCase(fetchCurrentUser.rejected, (state) => {
      state.user = undefined
      state.isLogin = false
      state.authChecked = true
    })
    // --- Update current user's profile ---
    builder.addCase(updateProfile.pending, (state) => {
      state.loading = true
      state.error = undefined
    })
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.loading = false
      state.error = undefined
      state.user = action.payload
      state.isLogin = true
    })
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.loading = false
      state.error = action.payload || { message: "Failed to update profile" }
    })
    // --- Logout (clear auth state even if the request fails) ---
    builder.addCase(logout.fulfilled, (state) => {
      state.user = undefined
      state.isLogin = false
      state.error = undefined
    })
    builder.addCase(logout.rejected, (state) => {
      state.user = undefined
      state.isLogin = false
    })
  },
})
export const { markAuthChecked } = authSlice.actions
export default authSlice.reducer
