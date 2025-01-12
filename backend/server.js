// Library
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
// Setting
import { connectDB } from "./lib/connectDB.js";
dotenv.config({ path: "/Users/youngjaekim/Desktop/e-commerce/backend/.env" });
// Routes
import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";

const PORT = process.env.PORT || 5009;

const app = express();
// SET THE MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
// Serve static files or basic pagesb
// app.get("/about", (req, res) => {
//   res.send("<h1>About Us</h1>");
// });

// app.get("/contact", (req, res) => {
//   res.send("<h1>Contact Us</h1>");
// });

// Routess
// API means user needs an authentication

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupon", couponRoutes);

// Listen PORT
app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING IN ${PORT} `);
  connectDB();
});
