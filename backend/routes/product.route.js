import express from "express";
const router = express.Router();
// Inner Route
import {
  getAllProducts,
  getFeaturedProducts,
} from "../controllers/product.controller.js";
import { verifyToken, adminRoute } from "../middleware/auth.middleware.js";

router.get("/", verifyToken, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);

export default router;
