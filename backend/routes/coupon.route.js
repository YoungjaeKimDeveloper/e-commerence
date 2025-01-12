import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  getCoupons,
  validateCoupon,
} from "../controllers/coupon.controller.js";
const router = express.Router();

router.get("/", verifyToken, getCoupons);
router.get("/validate/:id", verifyToken, validateCoupon);
export default router;
