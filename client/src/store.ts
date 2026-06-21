import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/auth/authReducer"
import usersReducer from "./slices/users/usersReducer"
import accessibilityReducer from "./slices/accessibility/accessibilityReducer"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    accessibility: accessibilityReducer,
  },
  devTools: import.meta.env.DEV,
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
