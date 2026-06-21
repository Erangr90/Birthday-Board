import { useNavigate } from "react-router-dom"
import "../styles/home.css"
function LandPage() {
  const navigate = useNavigate()
  return (
    <div className="land-page-div">
      <section className="land-page-welcome">
        <h1 className="land-page-welcome-title">
          Welcome to Birthday Board <span className="home-page-crown">👑</span>
        </h1>
        <p className="land-page-welcome-text">
          Keep birthdays organized, discover who is celebrating today, and manage
          your birthday list in one simple place.
        </p>
      </section>
      <p className="land-page-title">Please login or register to continue...</p>
      <div className="land-page-buttons">
        <button className="land-page-btn" onClick={() => navigate("/login")}>
          Login
        </button>
        <button className="land-page-btn" onClick={() => navigate("/register")}>
          Register
        </button>
      </div>
    </div>
  )
}

export default LandPage
