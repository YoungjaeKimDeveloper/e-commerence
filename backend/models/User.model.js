import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    // CART SETTING
    cartItems: [
      {
        quantity: {
          type: Number,
          default: 1,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],
    // Setting the Role
    // Set only two roles
  },
  { timestamps: true }
);
// Pre-Save
// 비밀번호 bcrpt 해주기
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});
// 인스턴스별 메세지 추가해주기
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};
// 민감한 정보 제거
UserSchema.methods.toJson = function () {
  const user = this;
  const userObject = user.toObject();

  // 민감한 데이터 제거
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", UserSchema);
// Pre-save hook to save hash password before saving to database

export default User;
