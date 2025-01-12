import Product from "../models/Product.model.js";

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;

    const existedItem = user.cartItems.find(
      (item) => item.product._id === productId
    );
    if (existedItem) {
      existedItem.quantity += 1;
    } else {
      user.cartItems.push({
        product: productId,
        quantity: 1,
      });
    }
    await user.save();
    return res.status(200).json({ success: true, message: "ITEM ADDED ✅" });
  } catch (error) {
    console.error("Error in addToCart controller", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const user = req.user;
    // 휴지통
    if (!productId) {
      user.cartItems = [];
    } else {
      user.cartItems = user.cartItems.filter(
        (item) => item.product._id !== productId
      );
    }
    await user.save();
    return res.status(200).json({ success: true, message: "ITEM REMOVED ✅" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "SERVER ERROR IN: removeAllFromCart ❌",
      error: error.message,
    });
  }
};

export const getCartProducts = async (req, res) => {
  try {
    const products = await Product.find({
      // Fishy
      _id: { $in: req.user.cartItems.map((item) => item.product._id) },
    });
    // add quantity for each product
    const cartItems = products.map((product) => {
      const item = req.user.cartItems.find(
        (cartItem) => cartItem._id == product.id
      );
      return { ...product.toJSON(), quantity: item.quantity };
    });
    return res.json(cartItems);
  } catch (error) {
    console.error("ERROR IN getCartProducts controller", error.message);
    return res
      .status(500)
      .json({ message: "SERVER ERROR", error: error.message });
  }
};

export const updateQuantity = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const { quantity } = req.body;
    const user = req.user;
    // fishy code
    // const existingItem = user.cartItems.find((item) => item.product.id === productId);
    const existingItem = user.cartItems.find(
      (item) => item.product._id.toString() === productId
    );

    if (existingItem) {
      if (quantity === 0) {
        user.cartItems = user.cartItems.filter(
          (item) => item.product.id.toString() !== productId
        );
        await user.save();
        return res
          .status(200)
          .json({ success: true, message: "Item quantity updated ✅" });
      }
      existingItem.quantity = quantity;
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Item quantity updated ✅" });
    }
  } catch (error) {
    console.error("FAILED to update Quantity");
    return res.status(500).json({
      success: false,
      message: `FAILED TO UPDATE QUANTITY ${error.message}`,
    });
  }
};
