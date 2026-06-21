import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  Popover,
} from "react-aria-components"
import type { AppDispatch, RootState } from "../store"
import { logout } from "../slices/auth/authActions"

function BoardHeader() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const navigate = useNavigate()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)

    try {
      await dispatch(logout()).unwrap()
    } catch {
    } finally {
      setIsLoggingOut(false)
      navigate("/", { replace: true })
    }
  }

  return (
    <header className="home-page-header">
      <h1 className="home-page-title">
        <Link to="/home" className="home-page-title-link">
          Birthday Board <span className="home-page-crown">👑</span>
        </Link>
      </h1>
      {user && (
        <MenuTrigger>
          <Button className="home-page-greeting">
            Welcome, {user.name}!
            <span className="home-page-caret">▾</span>
          </Button>
          <Popover className="app-popover" placement="bottom" offset={2}>
            <Menu className="home-page-dropdown" aria-label="User menu">
              <MenuItem
                className="home-page-dropdown-item"
                onAction={() => navigate("/profile")}
              >
                Profile
              </MenuItem>
              {user.role === "ADMIN" && (
                <MenuItem
                  className="home-page-dropdown-item"
                  onAction={() => navigate("/manage-users")}
                >
                  Manage all users
                </MenuItem>
              )}
              <MenuItem
                className="home-page-dropdown-item"
                isDisabled={isLoggingOut}
                onAction={handleLogout}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </MenuItem>
            </Menu>
          </Popover>
        </MenuTrigger>
      )}
    </header>
  )
}

export default BoardHeader
