import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.info("MONGO CONNECTED ✅");
  } catch (error) {
    console.error("FAILED TO MONGODB", error.message);
    process.exit(1);
  }
};
