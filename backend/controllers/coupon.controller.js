import Coupon from "../models/coupon.model.js";

export const getCoupons = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({
      userId: req.user._id,
      isActive: true,
    });
    return res.status(200).json({ success: true, coupon: coupon || null });
  } catch (error) {
    console.error("Error in getCoupon controller", error.message);
    return res
      .status(500)
      .json({ message: `SERVER ERROR IN: getCoupons❌: ${error.message} ` });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({
      code: code,
      userId: req.user._id,
      isActive: true,
    });
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "CANNOT FIND THE COUPON" });
    }
    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return res
        .status(404)
        .json({ success: false, message: "Coupon expired" });
    }
    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `server error in validateCoupon : ${error.message} `,
    });
  }
};
