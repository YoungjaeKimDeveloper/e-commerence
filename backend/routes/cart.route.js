import exporess from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
// Controlelrs
import {
  addToCart,
  getCartProducts,
  removeAllFromCart,
  updateQuantity,
} from "../controllers/cart.controller.js";

const router = exporess.Router();

router.post("/", verifyToken, addToCart);
router.get("/", verifyToken, getCartProducts);
router.delete("/", verifyToken, removeAllFromCart);
router.put("/:id", verifyToken, updateQuantity);

export default router;
