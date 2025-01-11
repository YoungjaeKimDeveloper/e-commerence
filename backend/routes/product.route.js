import express from "express";
const router = express.Router();
// Inner Route
import { getAllProducts } from "../controllers/product.controller.js";
import verifyToken from "../middleware/auth.middleware.js";

router.get("/", verifyToken, getAllProducts);

export default router;

// adminRoute
