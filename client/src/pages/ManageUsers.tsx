import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { z } from "zod"
import { Dialog, Modal, ModalOverlay } from "react-aria-components"
import type { AppDispatch, RootState } from "../store"
import {
  deleteUserById,
  fetchAllUsersAdmin,
} from "../slices/users/userActions"
import type { AdminUser } from "../types/user"
import { SUSPEND_DURATION_OPTIONS } from "../utils/suspendDurations"
import { getErrorMessage } from "../utils/getErrorMessage"
import BoardHeader from "../components/BoardHeader"
import "../styles/home.css"
import "../styles/manageUsers.css"

const ADMIN_PAGE_SIZE = 10


const SUSPEND_DURATION_VALUES = SUSPEND_DURATION_OPTIONS.map(
  (option) => option.value
)
const suspendDurationSchema = z
  .string()
  .refine(
    (value) => SUSPEND_DURATION_VALUES.includes(value),
    "Invalid suspend duration"
  )

function TrashIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  )
}

function ManageUsers() {
  const dispatch = useDispatch<AppDispatch>()
  const { adminUsers, adminPagination, adminLoading, adminError } = useSelector(
    (state: RootState) => state.users
  )

  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [suspendDuration, setSuspendDuration] = useState("none")
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | undefined>()

  useEffect(() => {
    dispatch(fetchAllUsersAdmin({ page, limit: ADMIN_PAGE_SIZE }))
  }, [dispatch, page])

  const openSuspendModal = (user: AdminUser) => {
    setSelectedUser(user)
    setSuspendDuration("none")
    setDeleteError(undefined)
  }

  const closeSuspendModal = () => {
    setSelectedUser(null)
  }

  const handleConfirm = async () => {
    if (!selectedUser) {
      return
    }

    const result = suspendDurationSchema.safeParse(suspendDuration)
    if (!result.success) {
      setDeleteError(result.error.issues[0].message)
      return
    }

    setDeleting(true)
    setDeleteError(undefined)

    try {
      await dispatch(
        deleteUserById({ id: selectedUser.id, suspendDuration: result.data })
      ).unwrap()

      setSelectedUser(null)
      dispatch(fetchAllUsersAdmin({ page, limit: ADMIN_PAGE_SIZE }))
    } catch (error) {
      setDeleteError(getErrorMessage(error as { message: string | string[] }))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="home-page">
      <BoardHeader />

      <section className="home-section">
        <h2 className="home-section-title">Manage Users</h2>

        {adminError ? (
          <p className="home-section-error">{getErrorMessage(adminError)}</p>
        ) : adminLoading && adminUsers.length === 0 ? (
          <p className="home-section-status">Loading users...</p>
        ) : adminUsers.length === 0 ? (
          <p className="home-section-status">No users found.</p>
        ) : (
          <>
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Birthday</th>
                    <th className="users-table-actions">Delete</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.birthDate}</td>
                      <td className="users-table-actions">
                        <button
                          type="button"
                          className="users-table-delete"
                          aria-label={`Delete ${user.name}`}
                          onClick={() => openSuspendModal(user)}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {adminPagination && adminPagination.totalPages > 1 && (
              <div className="users-table-pagination">
                <button
                  type="button"
                  className="users-table-page-btn"
                  onClick={() => setPage(adminPagination.page - 1)}
                  disabled={!adminPagination.hasPrevPage || adminLoading}
                >
                  Previous
                </button>
                <span className="users-table-page-info">
                  Page {adminPagination.page} of {adminPagination.totalPages}
                </span>
                <button
                  type="button"
                  className="users-table-page-btn"
                  onClick={() => setPage(adminPagination.page + 1)}
                  disabled={!adminPagination.hasNextPage || adminLoading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <ModalOverlay
        className="suspend-modal-overlay"
        isOpen={selectedUser !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            closeSuspendModal()
          }
        }}
        isDismissable={!deleting}
        isKeyboardDismissDisabled={deleting}
      >
        <Modal className="suspend-modal">
          <Dialog aria-label="Delete user">
            {selectedUser && (
              <>
                <h3 className="suspend-modal-title">Delete user</h3>
                <p className="suspend-modal-text">
                  Suspend <strong>{selectedUser.email}</strong> before deleting{" "}
                  {selectedUser.name}.
                </p>

                <label className="suspend-modal-label">
                  Suspend duration
                  <select
                    value={suspendDuration}
                    onChange={(event) => setSuspendDuration(event.target.value)}
                    disabled={deleting}
                  >
                    {SUSPEND_DURATION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                {deleteError && (
                  <p className="suspend-modal-error">{deleteError}</p>
                )}

                <div className="suspend-modal-actions">
                  <button
                    type="button"
                    className="suspend-modal-cancel"
                    onClick={closeSuspendModal}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="suspend-modal-confirm"
                    onClick={handleConfirm}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete user"}
                  </button>
                </div>
              </>
            )}
          </Dialog>
        </Modal>
      </ModalOverlay>
    </div>
  )
}

export default ManageUsers
