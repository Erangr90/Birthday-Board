import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useSearchParams } from "react-router-dom"
import type { AppDispatch, RootState } from "../store"
import {
  fetchUsersByBirthday,
  fetchUsersByDateRange,
} from "../slices/users/userActions"
import BoardHeader from "../components/BoardHeader"
import { MONTH_NAMES } from "../utils/months"
import {
  daySearchSchema,
  monthSearchSchema,
  rangeSearchSchema,
} from "../validations/searchSchema"
import { getErrorMessage } from "../utils/getErrorMessage"
import "../styles/home.css"
import "../styles/rangeSearch.css"

const RANGE_PAGE_SIZE = 12

function formatIsoToDisplay(isoDate: string) {
  const parts = isoDate.split("-")

  if (parts.length !== 3) {
    return isoDate
  }

  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

function getMonthName(month: string) {
  return MONTH_NAMES[Number(month) - 1] ?? ""
}

function SearchResults() {
  const dispatch = useDispatch<AppDispatch>()
  const [searchParams] = useSearchParams()
  const [page, setPage] = useState(1)

  const type = searchParams.get("type") ?? "range"
  const startDate = searchParams.get("startDate") ?? ""
  const endDate = searchParams.get("endDate") ?? ""
  const month = searchParams.get("month") ?? ""
  const day = searchParams.get("day") ?? ""

  const { rangeUsers, rangePagination, rangeLoading, rangeError, rangeSearched } =
    useSelector((state: RootState) => state.users)

    
  const hasValidSearch = useMemo(() => {
    if (type === "range") {
      return rangeSearchSchema.safeParse({ startDate, endDate }).success
    }
    if (type === "day") {
      return daySearchSchema.safeParse({ month, day }).success
    }
    if (type === "month") {
      return monthSearchSchema.safeParse({ month }).success
    }
    return false
  }, [type, startDate, endDate, month, day])

  useEffect(() => {
    setPage(1)
  }, [type, startDate, endDate, month, day])

  useEffect(() => {
    if (!hasValidSearch) {
      return
    }

    if (type === "range") {
      dispatch(
        fetchUsersByDateRange({
          startDate,
          endDate,
          page,
          limit: RANGE_PAGE_SIZE,
        })
      )
      return
    }

    dispatch(
      fetchUsersByBirthday({
        month: Number(month),
        day: type === "day" ? Number(day) : undefined,
        page,
        limit: RANGE_PAGE_SIZE,
      })
    )
  }, [dispatch, hasValidSearch, type, startDate, endDate, month, day, page])

  const errorMessage = getErrorMessage(rangeError)

  let description = ""
  if (type === "range") {
    description = `Showing users born between ${formatIsoToDisplay(startDate)} and ${formatIsoToDisplay(endDate)}.`
  } else if (type === "day") {
    description = `Showing users with a birthday on ${day}/${month}.`
  } else {
    description = `Showing users born in ${getMonthName(month)}.`
  }

  return (
    <div className="home-page">
      <BoardHeader />

      <section className="home-section">
        <h2 className="home-section-title">Search Results</h2>
        {hasValidSearch && (
          <p className="range-search-status">{description}</p>
        )}

        {!hasValidSearch ? (
          <p className="range-search-error">
            Missing search criteria. Please start a new search from the board.
          </p>
        ) : errorMessage ? (
          <p className="range-search-error">{errorMessage}</p>
        ) : rangeLoading && rangeUsers.length === 0 ? (
          <p className="range-search-status">Searching for birthdays...</p>
        ) : rangeSearched && rangeUsers.length === 0 ? (
          <p className="range-search-status">
            No users found for this search.
          </p>
        ) : (
          <>
            <div className="range-search-grid">
              {rangeUsers.map((user) => (
                <div className="user-card" key={`${user.email}-${user.name}`}>
                  <h2 className="user-card-name">{user.name}</h2>
                  <div className="user-card-details">
                    <div className="user-card-row">
                      <span className="user-card-label">Birthday</span>
                      <span>{user.birthDate}</span>
                    </div>
                    <div className="user-card-row">
                      <span className="user-card-label">Email for greetings</span>
                      <span>{user.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {rangePagination && rangePagination.totalPages > 1 && (
              <div className="range-search-pagination">
                <button
                  type="button"
                  className="range-search-page-btn"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={!rangePagination.hasPrevPage || rangeLoading}
                >
                  Previous
                </button>
                <span className="range-search-page-info">
                  Page {rangePagination.page} of {rangePagination.totalPages}
                </span>
                <button
                  type="button"
                  className="range-search-page-btn"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={!rangePagination.hasNextPage || rangeLoading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default SearchResults
