export type BirthdayUser = {
  name: string
  email: string
  birthDate: string
  userAge: number
  daysUntilNextBirthday: number
}

export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type PaginatedUsersResponse = {
  users: BirthdayUser[]
  pagination: Pagination
}

export type FetchUsersParams = {
  page: number
  limit: number
}

export type RangeUser = {
  name: string
  email: string
  birthDate: string
}

export type FetchUsersByRangeParams = {
  startDate: string
  endDate: string
  page: number
  limit: number
}

export type RangeUsersResponse = {
  users: RangeUser[]
  range: {
    startDate: string
    endDate: string
  }
  pagination: Pagination
}

export type FetchUsersByBirthdayParams = {
  month: number
  day?: number
  page: number
  limit: number
}

export type BirthdayUsersResponse = {
  users: RangeUser[]
  pagination: Pagination
}

export type AdminUser = {
  id: string
  name: string
  email: string
  birthDate: string
}

export type AdminUsersResponse = {
  users: AdminUser[]
  pagination: Pagination
}
