import { redis } from "../lib/redis.js";
import Product from "../models/Product.model.js";
import cloudinary from "../lib/cloudinary.config.js";

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

export const getFeaturedProducts = async (req, res) => {
  try {
    let featuredProducts = await redis.get("featured_products");
    if (featuredProducts) {
      return res.status(200).json({
        featuredProducts: JSON.parse(featuredProducts),
        success: true,
        featuredProducts: featuredProducts,
      });
    }
    // if there is no feature product in redis, fetch from mongodb
    featuredProducts = await Product.find({ isFeatured: true }).lean();

    if (!featuredProducts) {
      return res.status(404).json({ message: "No featured products found" });
    }
    // Redis : stroe the data string format
    await redis.set("featured_products", JSON.stringify(featuredProducts));
    return res
      .status(200)
      .json({ success: true, featuredProducts: featuredProducts });
  } catch (error) {
    console.error("Failed to get featured products", error.message);
    return res.status(500).json({
      success: false,
      message: `Failed to get featured products", ${error.message}`,
    });
  }
};

export const createProduct = async (req, res) => {
  try {
    let cloudinaryResponse = null;
    const { name, description, price, image, category } = req.body;

    if (image) {
      cloudinaryResponse = await cloudinary.uploader.upload(image, {
        folder: "products",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      image: cloudinaryResponse?.secure_url || "",
      category,
    });
    return res.status(201).json({ success: true, product: product });
  } catch (error) {
    console.error("Error in creating product controller", error.message);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
    if(!product){
      return res.status(400).json({success:false,message:"CANNOT FIND THE ITEM"})
    }
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ success: false, message: "Item deleted ✅" });
  } catch (error) {
    console.error("FAILED TO DELETE ITEM", error.message);
    return res.status(500).json({
      success: false,
      message: `FAILED TO DELETED ITEM ❌ ${error.message}`,
    });
  }
};
