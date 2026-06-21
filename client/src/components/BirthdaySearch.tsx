import { useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { MONTH_NAMES } from "../utils/months"
import {
  daySearchSchema,
  monthSearchSchema,
  rangeSearchSchema,
} from "../validations/searchSchema"
import "../styles/rangeSearch.css"

type SearchMode = "range" | "day" | "month"

function BirthdaySearch() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<SearchMode>("range")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [month, setMonth] = useState("")
  const [day, setDay] = useState("")
  const [error, setError] = useState<string | undefined>()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (mode === "range") {
      const result = rangeSearchSchema.safeParse({ startDate, endDate })
      if (!result.success) {
        setError(result.error.issues[0].message)
        return
      }
      navigate(
        `/search?type=range&startDate=${result.data.startDate}&endDate=${result.data.endDate}`
      )
      return
    }

    if (mode === "day") {
      const result = daySearchSchema.safeParse({ month, day })
      if (!result.success) {
        setError(result.error.issues[0].message)
        return
      }
      navigate(
        `/search?type=day&month=${result.data.month}&day=${result.data.day}`
      )
      return
    }

    const result = monthSearchSchema.safeParse({ month })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    navigate(`/search?type=month&month=${result.data.month}`)
  }

  const monthSelect = (
    <div className="range-search-field">
      <label htmlFor="search-month">Month</label>
      <select
        id="search-month"
        value={month}
        onChange={(event) => setMonth(event.target.value)}
      >
        <option value="">Select month</option>
        {MONTH_NAMES.map((name, index) => (
          <option key={name} value={index + 1}>
            {name}
          </option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="range-search">
      <form className="range-search-form" onSubmit={handleSubmit}>
        <div className="range-search-field">
          <label htmlFor="search-mode">Search by</label>
          <select
            id="search-mode"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as SearchMode)
              setError(undefined)
            }}
          >
            <option value="range">Date range</option>
            <option value="day">Day &amp; month</option>
            <option value="month">Month</option>
          </select>
        </div>

        {mode === "range" && (
          <>
            <div className="range-search-field">
              <label htmlFor="range-start-date">From</label>
              <input
                id="range-start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>
            <div className="range-search-field">
              <label htmlFor="range-end-date">To</label>
              <input
                id="range-end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
              />
            </div>
          </>
        )}

        {mode === "day" && (
          <>
            {monthSelect}
            <div className="range-search-field">
              <label htmlFor="search-day">Day</label>
              <input
                id="search-day"
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(event) => setDay(event.target.value)}
              />
            </div>
          </>
        )}

        {mode === "month" && monthSelect}

        <button type="submit" className="range-search-button">
          Search
        </button>
      </form>

      {error && <p className="range-search-error">{error}</p>}
    </div>
  )
}

export default BirthdaySearch
