// Modles
import express from "express";
// Controllers
import { signup, login, logout } from "../controllers/authController.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/logint", login);
router.post("/logout", logout);

export default router;
