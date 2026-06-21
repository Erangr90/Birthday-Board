export type RegisterForm = {
  name: string
  email: string
  password: string
  confirmPassword: string
  birthYear: string
  birthMonth: string
  birthDay: string
}

export type LoginForm = {
  email: string
  password: string
}

export type User = {
  id: string
  name: string
  email: string
  birthDate: string
  role: string
}

export type UpdateProfilePayload = {
  name: string
  email: string
  birthDate: string
  password?: string
}
