import "../styles/footer.css"

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="app-footer">
      <div className="app-footer-content">
        <div className="app-footer-section">
          <h3 className="app-footer-title">Birthday Board 👑</h3>
          <p className="app-footer-text">
            Birthday Board helps teams and friends never miss a birthday. Browse
            today&apos;s celebrants, search by date, and keep everyone&apos;s
            special day in one place.
          </p>
        </div>

        <div className="app-footer-section">
          <h4 className="app-footer-heading">About Us</h4>
          <p className="app-footer-text">
            We are a small team passionate about bringing people together. Our
            mission is to make celebrating each other simple and joyful.
          </p>
        </div>

        <div className="app-footer-section">
          <h4 className="app-footer-heading">Contact Info</h4>
          <ul className="app-footer-list">
            <li>
              Email:{" "}
              <a href="mailto:support@birthdayboard.com">
                support@birthdayboard.com
              </a>
            </li>
            <li>
              Phone: <a href="tel:+972500000000">+972 50-000-0000</a>
            </li>
            <li>Address: Tel Aviv, Israel</li>
          </ul>
        </div>
      </div>

      <div className="app-footer-bottom">
        © {currentYear} Eran Grady. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
