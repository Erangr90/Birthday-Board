import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../store"

type GuestRouteProps = {
  children: ReactNode
}

function GuestRoute({ children }: GuestRouteProps) {
  const isLogin = useSelector((state: RootState) => state.auth.isLogin)

  if (isLogin) {
    return <Navigate to="/home" replace />
  }

  return children
}

export default GuestRoute
