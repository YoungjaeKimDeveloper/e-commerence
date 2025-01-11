import Product from "../models/Product.model.js";

export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // find all Products
    return res.status(200).json({ success: true, products: products });
  } catch (error) {
    console.error("Failed to load products ❌, ", error.message);
    return res.status(500).json({
      success: false,
      message: `Failed to load products: ${error.message}`,
    });
  }
};

export const getFeaturedProducts = async () => {
  try {
  } catch (error) {}
};
