import type { BirthdayUser, Pagination } from "../types/user"
import UserCard from "./UserCard"
import "../styles/paginatedUsers.css"

type PaginatedUsersListProps = {
  users: BirthdayUser[]
  pagination?: Pagination
  loading: boolean
  onPageChange: (page: number) => void
}

function PaginatedUsersList({
  users,
  pagination,
  loading,
  onPageChange,
}: PaginatedUsersListProps) {
  if (loading && users.length === 0) {
    return <p className="users-list-status">Loading users...</p>
  }

  if (!loading && users.length === 0) {
    return <p className="users-list-status">No users found.</p>
  }

  return (
    <div className="users-list">
      <div className="users-list-grid">
        {users.map((user) => (
          <UserCard key={`${user.email}-${user.name}`} user={user} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="users-list-pagination">
          <button
            type="button"
            className="users-list-page-btn"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevPage || loading}
          >
            Previous
          </button>
          <span className="users-list-page-info">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            type="button"
            className="users-list-page-btn"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNextPage || loading}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default PaginatedUsersList
