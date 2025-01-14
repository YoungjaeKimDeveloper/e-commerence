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
    // CART Object
    cartItems: [
      // {product:product,quantity:quanttiy}
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  { timestamps: true }
);
// Pre-Hooks
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
// Instance method - comparePassword
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};
// Instance method - extra Secure
// UserSchema.methods.toJson = function () {
//   const user = this;
//   const userObject = user.toObject();

//   // 민감한 데이터 제거
//   delete userObject.password;
//   return userObject;
// };

const User = mongoose.model("User", UserSchema);

export default User;
