import User from "../models/User.model.js";

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
    return res.status(201).json({
      message: "NEW USER CREATED ✅",
      newUser: newUser.toJson(),
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
    return res
      .status(200)
      .json({ success: true, message: `Welcome Back ${user.name}` });
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
  } catch (error) {}
};
