import express from "express";
const router = express.Router();
// Inner Route
import {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendedProcuts,
  getProductsByCategory,
  toggleFeaturedProduct,
} from "../controllers/product.controller.js";
import { verifyToken, adminRoute } from "../middleware/auth.middleware.js";

// General Routes
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProcuts);
// Admin Routes
router.get("/", verifyToken, adminRoute, getAllProducts);
router.post("/", verifyToken, adminRoute, createProduct);
router.patch("/:id", verifyToken, adminRoute, toggleFeaturedProduct);
router.delete("/:id", verifyToken, adminRoute, deleteProduct);
export default router;
