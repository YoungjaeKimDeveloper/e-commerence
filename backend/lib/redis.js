import Redis from "ioredis";
import dotenv from "dotenv";

// Setting
dotenv.config({ path: "/Users/youngjaekim/Desktop/e-commerce/backend/.env" });
export const redis = new Redis(process.env.UPSTASH_Redis_URL);
// Key - Value Store
// await redis.set("foo", "bar");
