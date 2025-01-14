import { stripe } from "../lib/stripe.js";
// Models
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;
    let totalAmount = 0;
    let coupon = null;
    // 아이템이 Array형식이 아닌경우[Error Handling]
    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "IVALID or EMPTY products array" });
    }
    // 최종상품 가격

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // stripe watns you to send in the format of cents
      totalAmount += amount * product.quantity;
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
      };
    });

    if (couponCode) {
      coupon = await Coupon.findOne({
        userId: req.user._id,
        code: couponCode,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card", "paypal"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
        discounts: coupon
          ? [
              {
                coupon: await createStripeCoupon(coupon.discountPercentage),
              },
            ]
          : [],
        metadata: {
          userId: req.user._id,
          couponCode: couponCode || "",
          products: JSON.stringify(
            products.map((p) => ({
              id: p._id,
              quantity: p.quantity,
              price: p.price,
            }))
          ),
        },
      });
    }
    // Cents
    // If user spents over $200 = cents 20000
    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }
    return (
      res
        .status(200)
        //   $ - > cents/100
        .json({ id: session.id, totalAmount: totalAmount / 100 })
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `ERROR IN Processing session check ${error.message}`,
    });
  }
};

async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });
  return coupon.id;
}

async function createNewCoupon(userId) {
  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
    isActive: true,
    userId: userId,
  });

  await newCoupon.save();

  return newCoupon;
}

export const checkoutSuccess = async (req, res) => {
  try {
    // What is the Session ID?
    const { sessionId } = req.body;
    // 세션 추적 확인용 ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    // 추적하는 payment status
    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            userId: session.metadata.userId,
            code: session.metadata.couponCode,
          },
          {
            isActive: false,
          }
        );
      }
      // create a new order
      const products = JSON.parse(session.metadata.products);
      const newOrder = new Order({
        user: session.checkout.metadata.userId,
        stripeSessionId: sessionId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.totalAmount / 100, // convert from cents to dallors
        stripeSessionId: stripeSessionId,
      });
      await newOrder.save();
      return res.status(200).json({
        success: true,
        message:
          "Payment successful, order created, and coupon deactivated if used",
        orderId: newOrder._id,
      });
    }
  } catch (error) {
    console.error("Error processing successful checkout: ", error.message);
    return res.status(500).json({
      message: `Error processing successful checkout: ${error.message}`,
    });
  }
};
