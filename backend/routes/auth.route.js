// Modles
import express from "express";
// Controllers
import {
  signup,
  login,
  logout,
  refreshAccessToken,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/refresh-access-token", refreshAccessToken);
// To-Do
// router.post("/profile", getProfile);
export default router;
     