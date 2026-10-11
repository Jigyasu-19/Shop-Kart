const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const validId = (id) => mongoose.isObjectIdOrHexString(id);
const populatedCart = (customer) => Customer.populate(customer, {
  path: "cart.product",
  select: "name description price category image stock",
});

const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    if (!customer) return res.status(401).json({ message: "Unauthorized" });
    await populatedCart(customer);
    return res.json({ success: true, cart: customer.cart.filter((item) => item.product) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load cart" });
  }
};

const addToCart = async (req, res) => {
  const { productId } = req.params;
  if (!validId(productId)) return res.status(400).json({ message: "Invalid product ID" });
  try {
    const [customer, product] = await Promise.all([
      Customer.findById(req.user._id), Product.findById(productId),
    ]);
    if (!customer) return res.status(401).json({ message: "Unauthorized" });
    if (!product) return res.status(404).json({ message: "Product not found" });
    const item = customer.cart.find((entry) => entry.product.equals(productId));
    const quantity = (item?.quantity || 0) + 1;
    if (quantity > product.stock) return res.status(400).json({ message: "Requested quantity exceeds available stock" });
    if (item) item.quantity = quantity;
    else customer.cart.push({ product: productId, quantity: 1 });
    await customer.save();
    await populatedCart(customer);
    return res.status(200).json({ success: true, message: "Cart updated", cart: customer.cart.filter((entry) => entry.product) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update cart" });
  }
};

const updateCartQuantity = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  if (!validId(productId)) return res.status(400).json({ message: "Invalid product ID" });
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: "Quantity must be a number of at least 1" });
  }
  try {
    const [customer, product] = await Promise.all([
      Customer.findById(req.user._id), Product.findById(productId),
    ]);
    if (!customer) return res.status(401).json({ message: "Unauthorized" });
    if (!product) return res.status(404).json({ message: "Product not found" });
    const item = customer.cart.find((entry) => entry.product.equals(productId));
    if (!item) return res.status(404).json({ message: "Product is not in your cart" });
    if (quantity > product.stock) return res.status(400).json({ message: "Requested quantity exceeds available stock" });
    item.quantity = quantity;
    await customer.save();
    await populatedCart(customer);
    return res.json({ success: true, message: "Cart updated", cart: customer.cart.filter((entry) => entry.product) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update cart" });
  }
};

const removeFromCart = async (req, res) => {
  const { productId } = req.params;
  if (!validId(productId)) return res.status(400).json({ message: "Invalid product ID" });
  try {
    const customer = await Customer.findById(req.user._id);
    if (!customer) return res.status(401).json({ message: "Unauthorized" });
    const existingLength = customer.cart.length;
    customer.cart = customer.cart.filter((item) => !item.product.equals(productId));
    if (customer.cart.length === existingLength) return res.status(404).json({ message: "Product is not in your cart" });
    await customer.save();
    await populatedCart(customer);
    return res.json({ success: true, message: "Product removed from cart", cart: customer.cart.filter((item) => item.product) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to remove product from cart" });
  }
};

module.exports = { getCart, addToCart, updateCartQuantity, removeFromCart };
