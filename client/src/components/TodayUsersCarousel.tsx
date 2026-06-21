import { useEffect, useState } from "react"
import type { BirthdayUser } from "../types/user"
import UserCard from "./UserCard"
import "../styles/carousel.css"

const CARDS_PER_SLIDE = 3

type TodayUsersCarouselProps = {
  users: BirthdayUser[]
}

function TodayUsersCarousel({ users }: TodayUsersCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [users])

  if (users.length === 0) {
    return <p className="carousel-empty">No birthdays today.</p>
  }

  const lastSlideStart = Math.max(
    0,
    Math.floor((users.length - 1) / CARDS_PER_SLIDE) * CARDS_PER_SLIDE
  )
  const visibleUsers = users.slice(activeIndex, activeIndex + CARDS_PER_SLIDE)
  const totalSlides = Math.ceil(users.length / CARDS_PER_SLIDE)
  const currentSlide = Math.floor(activeIndex / CARDS_PER_SLIDE) + 1
  const canGoPrevious = activeIndex > 0
  const canGoNext = activeIndex < lastSlideStart

  const showPrevious = () => {
    setActiveIndex((index) => Math.max(0, index - CARDS_PER_SLIDE))
  }

  const showNext = () => {
    setActiveIndex((index) => Math.min(lastSlideStart, index + CARDS_PER_SLIDE))
  }

  return (
    <div className="carousel">
      <button
        type="button"
        className="carousel-btn"
        onClick={showPrevious}
        disabled={!canGoPrevious}
        aria-label="Previous birthdays"
      >
        ‹
      </button>

      <div className="carousel-slide">
        <div className="carousel-cards">
          {visibleUsers.map((user) => (
            <UserCard key={`${user.email}-${user.name}`} user={user} />
          ))}
        </div>
        {totalSlides > 1 && (
          <p className="carousel-counter">
            {currentSlide} / {totalSlides}
          </p>
        )}
      </div>

      <button
        type="button"
        className="carousel-btn"
        onClick={showNext}
        disabled={!canGoNext}
        aria-label="Next birthdays"
      >
        ›
      </button>
    </div>
  )
}

export default TodayUsersCarousel
