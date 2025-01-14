// Models
import Order from "../models/order.model.js";
import Product from "../models/Product.model.js";
import User from "../models/User.model.js";

export const getAnalyticsData = async () => {
  // 총 인원세주기
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  //   Sales Amount
  const salesData = await Order.aggregate([
    {
      $group: {
        _id: null, // it groups all documents together
        // 문서 하나당 숫자 1 증가
        totalSales: {
          $sum: 1,
        },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);
  // [] 배열중에 첫 번째 값 뽑기
  const { totalSales, totalRevenue } = salesData[0] || {
    totalSales: 0,
    totalRevenue: 0,
  };
  return {
    users: totalUsers,
    prodcuts: totalProducts,
    totalSales: totalSales,
    totalRevenue: totalRevenue,
  };
};

export const getDailySalesData = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      // Filter
      {
        // Filtering
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          // format the data
          _id: { $dateToString: { foramt: "%Y-%m-%d", date: "$createAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const dateArray = getDateInRange(startDate, endDate);
    // console.info(dateArray); ["2024-08-18" , "2024-08-19"]
    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item.id === date);

      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData.revenue || 0,
      };
    });
  } catch (error) {
    console.error("Error in analytics route", error.message);
    return res.status(500).json({
      message: `Server error in : getDailySalesData ${error.message}`,
    });
  }
};

function getDateInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}
