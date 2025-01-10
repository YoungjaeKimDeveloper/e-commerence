// Library
import express from "express";
import dotenv from "dotenv";

dotenv.config({ path: "/Users/youngjaekim/Desktop/e-commerce/backend/.env" });

const PORT = process.env.PORT;
const app = express();

console.log(PORT);

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Hello" });
});

app.listen(PORT, () => {
  console.log(`SERVER IS RUNNING IN ${PORT} `);
});
