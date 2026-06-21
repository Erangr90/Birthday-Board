import express from "express";
import {
  createUser,
  deleteUserById,
  getAllUsers,
  getAllUsersAdmin,
  getTodayUsers,
  getUsersByBirthDateRange,
  getUsersByBirthday,
  updateCurrentUser
} from "../controllers/userController";
import { protect, admin } from "../middlewares/authMiddleware";

const router = express.Router();




router.route("/today").get(protect, getTodayUsers);
router.route("/range").get(protect, getUsersByBirthDateRange);
router.route("/birthday").get(protect, getUsersByBirthday);
router.route("/me").patch(protect, updateCurrentUser);
router.route("/admin").get(protect, admin, getAllUsersAdmin);
router
  .route("/")
  .get(protect, getAllUsers)
  .post(protect, admin, createUser);
router.route("/:id").delete(protect, admin, deleteUserById);

export default router;
