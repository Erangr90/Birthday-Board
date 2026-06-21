import { useCallback, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "../store"
import { fetchAllUsers, fetchTodayUsers } from "../slices/users/userActions"
import BoardHeader from "../components/BoardHeader"
import TodayUsersCarousel from "../components/TodayUsersCarousel"
import PaginatedUsersList from "../components/PaginatedUsersList"
import BirthdaySearch from "../components/BirthdaySearch"
import { getErrorMessage } from "../utils/getErrorMessage"
import "../styles/home.css"

const ALL_USERS_PAGE_SIZE = 12
const TODAY_USERS_LIMIT = 100

function Home() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    todayUsers,
    todayLoading,
    todayError,
    allUsers,
    allPagination,
    allLoading,
    allError,
  } = useSelector((state: RootState) => state.users)

  useEffect(() => {
    dispatch(fetchTodayUsers({ page: 1, limit: TODAY_USERS_LIMIT }))
    dispatch(fetchAllUsers({ page: 1, limit: ALL_USERS_PAGE_SIZE }))
  }, [dispatch])


  const handleAllUsersPageChange = useCallback(
    (page: number) => {
      dispatch(fetchAllUsers({ page, limit: ALL_USERS_PAGE_SIZE }))
    },
    [dispatch]
  )

  return (
    <div className="home-page">
      <BoardHeader />

      <section className="home-section">
        <h2 className="home-section-title">Today&apos;s Birthdays</h2>
        {todayLoading && todayUsers.length === 0 ? (
          <p className="home-section-status">Loading today&apos;s birthdays...</p>
        ) : todayError ? (
          <p className="home-section-error">{getErrorMessage(todayError)}</p>
        ) : (
          <TodayUsersCarousel users={todayUsers} />
        )}
      </section>

      <section className="home-section">
        <h2 className="home-section-title">Search Birthdays</h2>
        <BirthdaySearch />
      </section>

      <section className="home-section">
        <h2 className="home-section-title">Upcoming Birthdays</h2>
        {allError ? (
          <p className="home-section-error">{getErrorMessage(allError)}</p>
        ) : (
          <PaginatedUsersList
            users={allUsers}
            pagination={allPagination}
            loading={allLoading}
            onPageChange={handleAllUsersPageChange}
          />
        )}
      </section>
    </div>
  )
}

export default Home
