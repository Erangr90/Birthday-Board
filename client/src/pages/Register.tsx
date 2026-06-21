import {
  useRef,
  useState,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import "../styles/register.css"
import { registerUser, sendRegistrationCode } from "../slices/auth/authActions"
import type { AppDispatch, RootState } from "../store"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import type { ServerError } from "../types/errors"
import Loader from "../components/Loader"
import BoardHeader from "../components/BoardHeader"
import "../styles/home.css"
import {
  MAX_USER_AGE,
  MIN_USER_AGE,
  MONTH_OPTIONS,
} from "../utils/age"
import {
  birthDateFieldsSchema,
  emailSchema,
  nameSchema,
  passwordSchema,
  refineBirthDate,
} from "../validations/userFormSchema"
import { useBirthDateOptions } from "../hooks/useBirthDateOptions"

const CODE_LENGTH = 6

const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    ...birthDateFieldsSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .superRefine(refineBirthDate)

type RegisterForm = z.infer<typeof registerSchema>


function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@")

  if (!domain) {
    return email
  }

  if (localPart.length <= 2) {
    return `${localPart[0] ?? ""}*@${domain}`
  }

  const visibleStart = localPart.slice(0, 2)
  const visibleEnd = localPart.length > 4 ? localPart.slice(-2) : ""
  const hiddenCount = localPart.length - visibleStart.length - visibleEnd.length

  return `${visibleStart}${"*".repeat(hiddenCount)}${visibleEnd}@${domain}`
}

function Register() {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()


  const [step, setStep] = useState<"form" | "code">("form")
  const [registrationData, setRegistrationData] = useState<RegisterForm | null>(
    null
  )

  const [expectedCode, setExpectedCode] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      birthYear: "",
      birthMonth: "",
      birthDay: "",
    },
  })

  const birthYear = watch("birthYear")
  const birthMonth = watch("birthMonth")

  const { yearOptions, dayOptions } = useBirthDateOptions(birthYear, birthMonth)

  const codeSchema = z.object({
    code: z
      .string({ message: "Verification code is required" })
      .regex(/^\d{6}$/, "Verification code must be 6 digits"),
  })

  const [codeDigits, setCodeDigits] = useState<string[]>(
    Array(CODE_LENGTH).fill("")
  )
  const [codeError, setCodeError] = useState("")
  const codeInputRefs = useRef<Array<HTMLInputElement | null>>([])

  // Keep one digit per box and move focus to the next box
  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)

    setCodeDigits((previous) => {
      const next = [...previous]
      next[index] = digit
      return next
    })

    if (digit && index < CODE_LENGTH - 1) {
      codeInputRefs.current[index + 1]?.focus()
    }
  }


  const handleDigitKeyDown = (
    index: number,
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !codeDigits[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus()
    }
  }

  
  const handleCodePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "")

    if (!pasted) {
      return
    }

    event.preventDefault()
    const next = Array(CODE_LENGTH).fill("")
    for (let i = 0; i < CODE_LENGTH; i++) {
      next[i] = pasted[i] ?? ""
    }
    setCodeDigits(next)

    const focusIndex = Math.min(pasted.length, CODE_LENGTH) - 1
    codeInputRefs.current[focusIndex]?.focus()
  }

  
  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "Passwords do not match" })
      return
    }

    try {
      const { code } = await dispatch(sendRegistrationCode(data)).unwrap()

      if (!code) {
        setError("root", {
          message:
            "This email can't be registered. Try a different one or log in.",
        })
        return
      }

      setExpectedCode(code)
      setRegistrationData(data)
      setStep("code")
    } catch (err: unknown) {
      console.error("Send code error:", err)
      const error = err as ServerError
      setError("root", {
        message:
          typeof error.message === "string" ? error.message : error.message[0],
      })
    }
  }

  
  const onVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!registrationData) {
      setStep("form")
      return
    }

    const code = codeDigits.join("")
    const result = codeSchema.safeParse({ code })

    if (!result.success) {
      setCodeError(result.error.issues[0].message)
      return
    }

    if (code !== expectedCode) {
      setCodeError("Verification code is invalid")
      return
    }

    try {
      await dispatch(registerUser(registrationData)).unwrap()
      navigate("/home")
    } catch (err: unknown) {
      console.error("Registration error:", err)
      const error = err as ServerError
      setCodeError(
        typeof error.message === "string" ? error.message : error.message[0]
      )
    }
  }

  if (loading) {
    return <Loader loading={loading} />
  }

  if (step === "code") {
    return (
      <>
        <BoardHeader />
        <div className="register-container register-page">
          <form onSubmit={onVerify} className="register-form">
            <h2>Verify your email</h2>
            <p className="birthdate-hint">
              We sent a 6-digit code to{" "}
              {maskEmail(registrationData?.email ?? "")}. Enter it below to
              finish creating your account.
            </p>
            <div className="code-inputs">
              {codeDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    codeInputRefs.current[index] = element
                  }}
                  className="code-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete="off"
                  value={digit}
                  onChange={(event) =>
                    handleDigitChange(index, event.target.value)
                  }
                  onKeyDown={(event) => handleDigitKeyDown(index, event)}
                  onPaste={handleCodePaste}
                />
              ))}
            </div>
            {codeError && <p className="error-message"> {codeError}</p>}
            <div className="verify-actions">
              <button
                className="submit-btn"
                type="button"
                onClick={() => setStep("form")}
              >
                Back
              </button>
              <button className="submit-btn" type="submit">
                Verify
              </button>
            </div>
          </form>
        </div>
      </>
    )
  }

  return (
    <>
      <BoardHeader />
      <div className="register-container register-page">
        <form onSubmit={handleSubmit(onSubmit)} className="register-form register-form--signup">
          <h2>We glad to have you on board!</h2>
          <label>
            Name:
            <input
              type="text"
              {...register("name")}
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="error-message"> {errors.name.message}</p>
            )}
          </label>

          <label>
            Email:
            <input
              type="email"
              autoComplete="email"
              {...register("email")}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="error-message"> {errors.email.message}</p>
            )}
          </label>

          <fieldset className="birthdate-fieldset">
            <legend>Birth Date</legend>
            <p className="birthdate-hint">
              Choose your year first. Age must be {MIN_USER_AGE}-{MAX_USER_AGE}{" "}
              years.
            </p>
            <div className="birthdate-fields">
              <label className="birthdate-select-label">
                Year
                <select {...register("birthYear")}>
                  <option value="" disabled>
                    Select year
                  </option>
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
                  <option value="" disabled>
                    Select month
                  </option>
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
                  <option value="" disabled>
                    Select day
                  </option>
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
            Password:
            <input
              type="password"
              autoComplete="new-password"
              {...register("password")}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="error-message"> {errors.password.message}</p>
            )}
          </label>

          <label>
            Confirm Password:
            <input
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="error-message"> {errors.confirmPassword.message}</p>
            )}
          </label>
          {error && <p className="error-message"> {error.message}</p>}
          {errors.root && (
            <p>
              {"\u2022 "}
              {errors.root.message}
            </p>
          )}
          <button className="submit-btn" type="submit">
            Submit
          </button>
          <p className="register-login-hint">
            Already have an account?{" "}
            <Link to="/login" className="register-login-link">
              Login
            </Link>
          </p>
        </form>
      </div>
    </>
  )
}

export default Register
