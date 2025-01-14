import express from "express";
import { adminRoute, verifyToken } from "../middleware/auth.middleware.js";
import {
  getAnalyticsData,
  getDailySalesData,
} from "../controllers/analyticsController.js";
const router = express.Router();

// Routes and Controller
router.get("/", verifyToken, adminRoute, async (req, res) => {
  try {
    // get the  Anaylze the Data
    const analyticsData = await getAnalyticsData();

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 1000 * 60 * 60 * 24 * 7);

    const dailySalesData = await getDailySalesData(startDate, endDate);

    return res.status(200).json({
      analyticsData: analyticsData,
      dailySalesData: dailySalesData,
    });
  } catch (error) {
    console.error("Error in analytics route", error.message);
    return res.status(500).json({
      success: false,
      message: `Server Error in Analytics Route: ${error.message}`,
    });
  }
});
export default router;
