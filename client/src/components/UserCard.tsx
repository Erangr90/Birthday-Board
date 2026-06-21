import { memo } from "react"
import type { BirthdayUser } from "../types/user"
import "../styles/userCard.css"

type UserCardProps = {
  user: BirthdayUser
}

function UserCard({ user }: UserCardProps) {
  const { name, email, birthDate, userAge, daysUntilNextBirthday } = user

  return (
    <div className="user-card">
      <h2 className="user-card-name">{name}</h2>
      <div className="user-card-details">
        <div className="user-card-row">
          <div>
            Celebrant <span className="user-card-label">{userAge}</span> years{" "}
            {daysUntilNextBirthday === 0
              ? "today"
              : daysUntilNextBirthday === 1
                ? "tomorrow"
                : daysUntilNextBirthday < 8
                  ? `in ${daysUntilNextBirthday} days`
                  : `at ${birthDate}`}
          </div>
        </div>
        <div className="user-card-row">
          <span className="user-card-label">Email for greetings</span>
          <span>{email}</span>
        </div>
      </div>
    </div>
  )
}


export default memo(UserCard)
