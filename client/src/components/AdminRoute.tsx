import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../store"

type AdminRouteProps = {
  children: ReactNode
}

function AdminRoute({ children }: AdminRouteProps) {
  const { isLogin, user } = useSelector((state: RootState) => state.auth)

  if (!isLogin) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to="/home" replace />
  }

  return children
}

export default AdminRoute
