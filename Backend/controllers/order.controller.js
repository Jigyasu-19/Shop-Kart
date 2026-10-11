const crypto = require("crypto");
const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const { createRazorpayClient, hasRazorpayKeys } = require("../config/razorpay");

const validateShippingAddress = (address = {}) => {
  const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  for (const field of fields) {
    if (typeof address[field] !== "string" || !address[field].trim()) return `${field} is required`;
  }
  if (!/^\+?[0-9][0-9\s-]{8,14}$/.test(address.phone.trim())) return "Enter a valid phone number";
  if (!/^\d{6}$/.test(address.pincode.trim())) return "Pincode must contain 6 digits";
  return "";
};

const createPaymentOrder = async (req, res) => {
  const shippingAddress = req.body?.shippingAddress;
  const addressError = validateShippingAddress(shippingAddress);
  if (addressError) return res.status(400).json({ message: addressError });
  if (!hasRazorpayKeys()) return res.status(503).json({ message: "Razorpay Test Mode keys are not configured on the server" });

  let order;
  try {
    const customer = await Customer.findById(req.user._id);
    if (!customer) return res.status(401).json({ message: "Unauthorized" });
    if (!customer.cart.length) return res.status(400).json({ message: "Your cart is empty" });

    const items = [];
    let totalAmount = 0;
    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);
      if (!product) return res.status(400).json({ message: "A product in your cart is no longer available" });
      if (cartItem.quantity > product.stock) return res.status(400).json({ message: `Insufficient stock for ${product.name}.` });
      items.push({ product: product._id, name: product.name, price: product.price, quantity: cartItem.quantity, image: product.image });
      totalAmount += product.price * cartItem.quantity;
    }

    order = await Order.create({
      user: customer._id,
      items,
      shippingAddress: Object.fromEntries(Object.entries(shippingAddress).map(([key, value]) => [key, value.trim()])),
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
    const razorpayOrder = await createRazorpayClient().orders.create({
      amount: Math.round(order.totalAmount * 100), currency: "INR", receipt: order._id.toString(),
    });
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    if (order) await Order.deleteOne({ _id: order._id }).catch(() => {});
    console.error("Create payment order failed:", error.message);
    return res.status(502).json({ message: "Unable to start payment. Your cart is unchanged; please try again." });
  }
};

const verifyPayment = async (req, res) => {
  const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
  if (!mongoose.isObjectIdOrHexString(shopKartOrderId) || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: "Payment details are incomplete" });
  }
  if (!process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ message: "Razorpay Test Mode is not configured on the server" });

  try {
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.paymentStatus === "PAID") return res.json({ success: true, order });
    if (order.razorpayOrderId !== razorpay_order_id) return res.status(400).json({ message: "Payment order does not match" });

    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`).digest("hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    const signatureBuffer = Buffer.from(razorpay_signature, "hex");
    if (expectedBuffer.length !== signatureBuffer.length || !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) return res.status(401).json({ message: "Unauthorized" });
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    customer.cart = [];
    await customer.save();
    return res.json({ success: true, order });
  } catch (error) {
    console.error("Verify payment failed:", error.message);
    return res.status(500).json({ message: "Unable to verify payment" });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) { return res.status(500).json({ message: "Unable to load orders" }); }
};

const getOrder = async (req, res) => {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(404).json({ message: "Order not found" });
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json({ success: true, order });
  } catch (error) { return res.status(500).json({ message: "Unable to load order" }); }
};

module.exports = { createPaymentOrder, verifyPayment, getOrders, getOrder };
