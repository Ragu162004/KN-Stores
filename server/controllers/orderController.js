import Order from "../models/Order.js";
import Product from "../models/Product.js";
import stripe from "stripe";
import User from "../models/User.js";
import {
  sendOrderConfirmationEmail,
  sendOrderCancellationEmail,
  sendOrderDeliveryEmail,
} from "../utils/nodeMailer.utils.js";

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let amount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.StockNumber < item.quantity) {
        return res.json({ success: false, message: "Insufficient stock for product" });
      }

      product.StockNumber -= item.quantity;
      if (product.StockNumber === 0) product.inStock = false;
      await product.save();

      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // Add 2% tax

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    const populatedOrder = await Order.findById(order._id).populate("items.product");
    const user = await User.findById(userId);
    await sendOrderConfirmationEmail(user.email, populatedOrder);

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;

    if (!address || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];
    let amount = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || product.StockNumber < item.quantity) {
        return res.json({ success: false, message: "Insufficient stock for product" });
      }

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });

      product.StockNumber -= item.quantity;
      if (product.StockNumber === 0) product.inStock = false;
      await product.save();

      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // Add 2% tax

    if (amount < 50) {
      return res.json({
        success: false,
        message: "Minimum order amount must be at least ₹50 for online payments.",
      });
    }

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    const populatedOrder = await Order.findById(order._id).populate("items.product");
    const user = await User.findById(userId);
    await sendOrderConfirmationEmail(user.email, populatedOrder);

    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: { name: item.name },
        unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
      },
      quantity: item.quantity,
    }));

    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Stripe Webhook : /stripe
export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: event.data.object.id,
      });

      const { orderId, userId } = session.data[0].metadata;
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }

    case "payment_intent.payment_failed": {
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: event.data.object.id,
      });

      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }

    default:
      console.error(`Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
};

// Get Orders by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Get All Orders : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Cancel Order by Admin: /api/order/cancel/seller/:orderId
export const cancelOrderByAdmin = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("items.product");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel ${order.status} order` });
    }

    order.status = "Cancelled";
    await order.save();

    const user = await User.findById(order.userId);
    await sendOrderCancellationEmail(user.email, order);

    res.json({ success: true, message: "Order cancelled by admin", order });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Cancel Order by User: /api/order/cancel/user/:orderId
export const cancelOrderByUser = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;

    const order = await Order.findById(orderId).populate("items.product");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.userId.toString() !== userId)
      return res.status(403).json({ success: false, message: "Not authorized to cancel this order" });

    if (["Shipped", "Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel ${order.status} order` });
    }

    order.status = "Cancelled";
    await order.save();

    const user = await User.findById(userId);
    await sendOrderCancellationEmail(user.email, order);

    res.json({ success: true, message: "Order cancelled", order });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Mark as Delivered by Admin: /api/order/deliver/:orderId
export const deliverOrderByAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate("items.product");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    order.isPaid = true;
    order.status = "Delivered";
    await order.save();

    const user = await User.findById(order.userId);
    await sendOrderDeliveryEmail(user.email, order);

    res.status(200).json({ success: true, message: "Order marked as delivered" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
