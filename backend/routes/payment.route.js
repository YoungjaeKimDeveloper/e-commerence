import { stripe } from "../lib/stripe.js";
import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
// Controllers
import {
  createCheckoutSession,
  checkoutSuccess,
} from "../controllers/paymentController.js";
// Models

const router = express.Router();

router.post("/create-checkout-session", verifyToken, createCheckoutSession);

router.post("/checkout-success", verifyToken, checkoutSuccess);
export default router;
