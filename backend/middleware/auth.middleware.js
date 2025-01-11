import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const verifyToken = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(400).json({ success: false, message: "NO TOKEN ❌" });
    }
    const decoded = jwt.verify(accessToken, process.env.ACESS_TOKEN_SECRET);
    if (!decoded) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Token ❌" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid user" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Failed to verify ❌: ", error.message);
    return res.status(500).json({
      success: false,
      message: `FAILED TO VERIFY TOKEN ${error.message}`,
    });
  }
};

export default verifyToken;
