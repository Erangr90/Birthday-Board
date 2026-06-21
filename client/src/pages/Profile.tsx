import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import type { AppDispatch, RootState } from "../store"
import { logout, updateProfile } from "../slices/auth/authActions"
import type { ServerError } from "../types/errors"
import BoardHeader from "../components/BoardHeader"
import { formatBirthDate, MONTH_OPTIONS } from "../utils/age"
import {
  birthDateFieldsSchema,
  emailSchema,
  nameSchema,
  PASSWORD_PATTERN,
  refineBirthDate,
} from "../validations/userFormSchema"
import { useBirthDateOptions } from "../hooks/useBirthDateOptions"
import "../styles/home.css"
import "../styles/register.css"
import "../styles/profile.css"

const profileSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    ...birthDateFieldsSchema,
    password: z
      .string()
      .refine(
        (value) => value === "" || PASSWORD_PATTERN.test(value),
        "password must be 8-50 characters and contain an uppercase letter, a lowercase letter, a number and a special character"
      ),
  })
  .superRefine(refineBirthDate)

type ProfileForm = z.infer<typeof profileSchema>

function Profile() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const [success, setSuccess] = useState<string | undefined>()

  const birth = useMemo(
    () => (user ? new Date(user.birthDate) : new Date()),
    [user]
  )

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      birthYear: String(birth.getUTCFullYear()),
      birthMonth: String(birth.getUTCMonth() + 1),
      birthDay: String(birth.getUTCDate()),
      password: "",
    },
  })

  const birthYear = watch("birthYear")
  const birthMonth = watch("birthMonth")

  const { yearOptions, dayOptions } = useBirthDateOptions(birthYear, birthMonth)

  const onSubmit = async (data: ProfileForm) => {
    setSuccess(undefined)

    const birthDate = formatBirthDate(data.birthYear, data.birthMonth, data.birthDay)
    const payload = {
      name: data.name,
      email: data.email,
      birthDate,
      ...(data.password ? { password: data.password } : {}),
    }

    const emailChanged = data.email !== user?.email
    const passwordChanged = Boolean(data.password)

    try {
      await dispatch(updateProfile(payload)).unwrap()

      if (emailChanged || passwordChanged) {
        await dispatch(logout())
        navigate("/")
        return
      }

      reset({ ...data, password: "" })
      setSuccess("Your details were saved.")
    } catch (err) {
      const error = err as ServerError
      setError("root", {
        message:
          typeof error.message === "string" ? error.message : error.message[0],
      })
    }
  }

  return (
    <div className="home-page">
      <BoardHeader />

      <section className="home-section">
        <h2 className="home-section-title">My Profile</h2>

        <div className="profile-card">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="register-form profile-form"
          >
            <label>
              Name:
              <input type="text" {...register("name")} />
              {errors.name && (
                <p className="error-message">{errors.name.message}</p>
              )}
            </label>

            <label>
              Email:
              <input
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="error-message">{errors.email.message}</p>
              )}
            </label>

            <fieldset className="birthdate-fieldset">
              <legend>Birth Date</legend>
              <div className="birthdate-fields">
                <label className="birthdate-select-label">
                  Year
                  <select {...register("birthYear")}>
                    {yearOptions.map((year) => (
                      <option key={year} value={String(year)}>
                        {year}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="birthdate-select-label">
                  Month
                  <select {...register("birthMonth")}>
                    {MONTH_OPTIONS.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="birthdate-select-label">
                  Day
                  <select {...register("birthDay")}>
                    {dayOptions.map((day) => (
                      <option key={day} value={String(day)}>
                        {day}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {(errors.birthYear || errors.birthMonth || errors.birthDay) && (
                <p className="error-message">
                  {errors.birthYear?.message ||
                    errors.birthMonth?.message ||
                    errors.birthDay?.message}
                </p>
              )}
            </fieldset>

            <label>
              New Password:
              <input
                type="password"
                autoComplete="new-password"
                {...register("password")}
                placeholder="Leave blank to keep current password"
              />
              <p className="profile-hint">
                Fill this only if you want to change your password.
              </p>
              {errors.password && (
                <p className="error-message">{errors.password.message}</p>
              )}
            </label>

            {errors.root && (
              <p className="error-message">{errors.root.message}</p>
            )}
            {success && <p className="profile-success">{success}</p>}

            <button className="submit-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Profile
