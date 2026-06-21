import express from "express"
import { register, sendCode, login, logout, refresh, getMe } from "../controllers/authController"
import { protect } from "../middlewares/authMiddleware"
const router = express.Router()




router.route("/send-code").post(sendCode)
router.route("/").post( register)
router.route("/login").post( login)
router.route("/logout").post( logout)
router.route("/refresh").post( refresh)
router.route("/me").get(protect, getMe)

export default router
