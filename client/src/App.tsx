import { lazy, Suspense, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import type { AppDispatch, RootState } from "./store"
import {
  AUTH_SESSION_HINT_KEY,
  fetchCurrentUser,
  logout,
} from "./slices/auth/authActions"
import { markAuthChecked } from "./slices/auth/authReducer"
import { ACCESSIBILITY_STORAGE_KEY } from "./slices/accessibility/accessibilityReducer"
import { setOnSessionExpired } from "./utils/axiosClient"
import ProtectedRoute from "./components/ProtectedRoute"
import AdminRoute from "./components/AdminRoute"
import GuestRoute from "./components/GuestRoute"
import ErrorBoundary from "./components/ErrorBoundary"
import Loader from "./components/Loader"
import Footer from "./components/Footer"
import AccessibilityPanel from "./components/AccessibilityPanel"

// Each page is loaded on demand (route-based code splitting), so the initial
// bundle stays small and a visitor only downloads the page they actually open.
const LandPage = lazy(() => import("./pages/LandPage"))
const Home = lazy(() => import("./pages/Home"))
const SearchResults = lazy(() => import("./pages/SearchResults"))
const Profile = lazy(() => import("./pages/Profile"))
const ManageUsers = lazy(() => import("./pages/ManageUsers"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))

function App() {
  const dispatch = useDispatch<AppDispatch>()
  const authChecked = useSelector((state: RootState) => state.auth.authChecked)
  const isLogin = useSelector((state: RootState) => state.auth.isLogin)
  const accessibility = useSelector((state: RootState) => state.accessibility)

  useEffect(() => {
    const hasSessionHint =
      window.localStorage.getItem(AUTH_SESSION_HINT_KEY) === "1"

    if (!hasSessionHint) {
      dispatch(markAuthChecked())
      return
    }

    dispatch(fetchCurrentUser())
  }, [dispatch])

  // When the axios interceptor cannot refresh an expired session, clear the
  // auth state here so the route guards send the user back to the login page.
  useEffect(() => {
    setOnSessionExpired(() => {
      dispatch(logout())
    })
  }, [dispatch])

  // Re-validate the session when the user comes back to the tab, so a session
  // revoked while the tab was hidden is detected promptly. Only runs while
  // logged in to avoid pinging the server for guests.
  //
  // We listen to `visibilitychange` (fires only on a real tab show/hide) rather
  // than `focus` (which fires on every window refocus, e.g. clicking back from
  // DevTools) and throttle to at most one check per minute. This keeps the
  // security benefit while cutting the redundant /auth/me traffic.
  const lastRevalidateRef = useRef(0)
  useEffect(() => {
    if (!isLogin) {
      return
    }

    const REVALIDATE_INTERVAL_MS = 60_000

    const revalidate = () => {
      if (document.visibilityState !== "visible") {
        return
      }

      const now = Date.now()
      if (now - lastRevalidateRef.current < REVALIDATE_INTERVAL_MS) {
        return
      }

      lastRevalidateRef.current = now
      dispatch(fetchCurrentUser())
    }

    document.addEventListener("visibilitychange", revalidate)
    return () => document.removeEventListener("visibilitychange", revalidate)
  }, [dispatch, isLogin])

  useEffect(() => {
    const { highContrast, largeText, reduceMotion, strongFocus } = accessibility

    document.body.classList.toggle("a11y-high-contrast", highContrast)
    document.body.classList.toggle("a11y-large-text", largeText)
    document.body.classList.toggle("a11y-reduce-motion", reduceMotion)
    document.body.classList.toggle("a11y-strong-focus", strongFocus)

    window.localStorage.setItem(
      ACCESSIBILITY_STORAGE_KEY,
      JSON.stringify(accessibility)
    )
  }, [accessibility])

  if (!authChecked) {
    return (
      <div className="app-loading">
        <h1 className="visually-hidden">Birthday Board</h1>
        <Loader loading={true} />
      </div>
    )
  }

  return (
    <Router>
      <div className="app-shell">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <main id="main-content" className="app-content">
          <h1 className="visually-hidden">Birthday Board</h1>
          <ErrorBoundary>
            <Suspense fallback={<Loader loading={true} />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <GuestRoute>
                      <LandPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/home"
                  element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <SearchResults />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-users"
                  element={
                    <AdminRoute>
                      <ManageUsers />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <Login />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <Register />
                    </GuestRoute>
                  }
                />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <AccessibilityPanel />
        <Footer />
      </div>
    </Router>
  )
}

export default App
