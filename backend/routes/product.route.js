import express from "express";
const router = express.Router();
// Inner Route
import {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendedProcuts,
} from "../controllers/product.controller.js";
import { verifyToken, adminRoute } from "../middleware/auth.middleware.js";

router.get("/", verifyToken, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/recommendations", getRecommendedProcuts);
// Create the Product
router.post("/", verifyToken, adminRoute, createProduct);
router.delete("/:id", verifyToken, adminRoute, deleteProduct);
export default router;
