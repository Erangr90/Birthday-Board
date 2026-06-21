import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import "../styles/register.css"
import { loginUser } from "../slices/auth/authActions"
import type { AppDispatch, RootState } from "../store"
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import type { ServerError } from "../types/errors"
import { emailSchema, passwordSchema } from "../validations/userFormSchema"
import Loader from "../components/Loader"
import BoardHeader from "../components/BoardHeader"
import "../styles/home.css"

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

type LoginForm = z.infer<typeof loginSchema>

function Login() {
  const dispatch = useDispatch<AppDispatch>()
  const { loading, error } = useSelector((state: RootState) => state.auth)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await dispatch(loginUser(data)).unwrap()
      navigate("/home")
    } catch (err: unknown) {
      console.error("Login error:", err)
      const error = err as ServerError
      setError("root", {
        message:
          typeof error.message === "string" ? error.message : error.message[0],
      })
    }
  }

  if (loading) {
    return <Loader loading={loading} />
  }

  return (
    <>
      <BoardHeader />
      <div className="register-container">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="register-form login-form"
        >
          <h2>Welcome back!</h2>

          <label>
            <span className="login-field-label">Email:</span>
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

          <label>
            <span className="login-field-label">Password:</span>
            <input
              type="password"
              autoComplete="current-password"
              {...register("password")}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="error-message"> {errors.password.message}</p>
            )}
            {error && <p className="error-message"> {error.message}</p>}
          </label>
          {errors.root && (
            <p>
              {"\u2022 "}
              {errors.root.message}
            </p>
          )}
          <button className="submit-btn" type="submit">
            Submit
          </button>
          <p className="login-register-hint">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="login-register-link">
              Register here
            </Link>
          </p>
        </form>
      </div>
    </>
  )
}

export default Login
