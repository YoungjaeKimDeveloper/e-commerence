// Library
import express from "express";
import dotenv from "dotenv";

// Setting
dotenv.config({ path: "/Users/youngjaekim/Desktop/e-commerce/backend/.env" });
// Routes
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/connectDB.js";

const PORT = process.env.PORT || 5009;

const app = express();
// SET THE MIDDLEWARE
app.use(express.json());

// Routess
app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING IN ${PORT} `);
  connectDB();
});
