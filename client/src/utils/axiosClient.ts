import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios"

const axiosClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
})

// Marks a request we already retried once after refreshing, so we never loop.
type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

// Called when the session cannot be refreshed (truly logged out / expired).
// App.tsx registers a handler that clears the Redux auth state. Kept as a
// callback so this module does not import the store, which would create a
// circular import (store -> reducer -> actions -> axiosClient).
let onSessionExpired: (() => void) | null = null

export function setOnSessionExpired(handler: () => void) {
  onSessionExpired = handler
}

// Only access-token-protected calls should try to refresh on a 401. The auth
// handshake itself (login, register, refresh, logout) must not, or a failed
// login would loop forever. "/auth/me" is allowed so a returning user with an
// expired access token but a still-valid refresh token is logged back in.
function shouldAttemptRefresh(url: string): boolean {
  if (url === "/auth/me") {
    return true
  }

  return !url.startsWith("/auth")
}

// Ensures only one refresh request is in flight; concurrent 401s share it
// instead of each firing their own /auth/refresh (which would rotate the
// refresh token repeatedly and trip the server's reuse detection).
let refreshPromise: Promise<void> | null = null

export function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = axiosClient
      .post("/auth/refresh")
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

// On a 401, transparently refresh the access token once and retry the original
// request. The short-lived access token + rotating refresh token (built on the
// server) only help if the client actually uses /auth/refresh, which is what
// this interceptor does.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined
    const url = original?.url ?? ""

    const canRetry =
      error.response?.status === 401 &&
      original !== undefined &&
      !original._retry &&
      shouldAttemptRefresh(url)

    if (!canRetry) {
      return Promise.reject(error)
    }

    original._retry = true

    try {
      await refreshSession()
      return axiosClient(original)
    } catch {
      // Refresh failed: the session is really gone. Let the app clear its auth
      // state so the route guards redirect the user to the login page.
      onSessionExpired?.()
      return Promise.reject(error)
    }
  }
)

export default axiosClient
