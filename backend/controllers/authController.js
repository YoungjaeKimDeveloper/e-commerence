import { redis } from "../lib/redis.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
// Models
import User from "../models/User.model.js";
dotenv.config({ path: "/Users/youngjaekim/Desktop/e-commerce/backend/.env" });
// generate Token
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

// Store tokens in Cookies
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV == "production",
    sameStie: "strict", //prevents CSRF attack, cross-site request forgery
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // prevent XSS attacks, cross site scripting attack
    secure: process.env.NODE_ENV == "production",
    sameStie: "strict", //prevents CSRF attack, cross-site request forgery
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};
// Only Refresh Token will be stored in Reds
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 60
  );
};
export const signup = async (req, res) => {
  try {
    // 유저가 보낸 정보
    const { name, email, password } = req.body;
    if (!email || !password || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Please Fill up the all forms" });
    }
    // 비밀번호 길이 체크
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password should be at least 6 letters",
      });
    }
    // 이메일 중복 체크
    const existedUser = await User.findOne({ email: email });
    if (existedUser) {
      return res
        .status(400)
        .json({ success: false, message: "EMAIL EXISTED!" });
    }
    // 새로운 유저 생성
    const newUser = new User({ name, email, password });
    await newUser.save();
    const { accessToken, refreshToken } = generateTokens(newUser._id);
    // Store Token in UpStash
    await storeRefreshToken(newUser._id, refreshToken);
    setCookies(res, accessToken, refreshToken);
    return res.status(201).json({
      message: "NEW USER CREATED ✅",
      user: {
        id: newUser._id,
        name: newUser.name,
        emial: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("FAILED TO CREATE NEW USER", error.message);
    return res
      .status(500)
      .json({ message: `Failed to create new user: ${error.message}` });
  }
};

export const login = async (req, res) => {
  try {
    // 유저에게서 정보 받아오기
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please Fill up the all forms" });
    }
    const user = await User.findOne({ email: email });
    // 이메일 맞지않을때
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "CANNOT FIND A USER WITH AN EMAIL" });
    }
    const isCorrectPassword = await user.comparePassword(password);
    if (!isCorrectPassword) {
      return res
        .status(400)
        .json({ success: false, message: "PASSWORD IS NOT CREDENTIAL" });
    }
    const { accessToken, refreshToken } = generateTokens(user._id);
    setCookies(res, accessToken, refreshToken);
    await storeRefreshToken(user._id, refreshToken);
    return res.status(200).json({
      success: true,
      message: `Welcome Back ${user.name}`,
      user: {
        id: user._id,
        name: user.name,
        emial: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`FAIL TO LOGIN❌ : ${error.message}`);
    return res.status(500).json({
      success: false,
      message: `FAILED TO LOGIN ❌: ${error.message}`,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decode.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully ✅" });
  } catch (error) {
    console.error("FAILED TO LOGOUT", error.message);
    res.status(500).json({ success: false, message: "Failed to logout ❌" });
  }
};
// RefreshToekn -> Access Token
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "NO RefreshToekn ❌" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded) {
      return res
        .status(400)
        .json({ success: false, message: "INVALID FRESH TOKEN" });
    }

    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (!storedToken) {
      return res
        .status(400)
        .json({ success: false, message: "CANNOT FIND THE VALID TOKEN" });
    }
    // Compare Redis  & refresh Token
    if (storedToken !== refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "INVALID REFRESH TOKEN" });
    }
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
    res.cookie("accessToken", accessToken, {
      httpOnly: true, // prevent XSS attacks, cross site scripting attack
      secure: process.env.NODE_ENV == "production",
      sameStie: "strict", //prevents CSRF attack, cross-site request forgery
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    return res
      .status(200)
      .json({ success: true, message: "Token refreshed successfully" });
  } catch (error) {
    console.error("ERROR IN RefreshToken controller", error.message);
    res
      .status(500)
      .json({ success: false, message: `Server ERROR ${error.message}` });
  }
};
// TODO
// export const getProfile = async (req, res) => {
//   try {

//   } catch (error) {}
// };
