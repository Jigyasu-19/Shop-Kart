const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

const isValidProductId = (id) => mongoose.isObjectIdOrHexString(id);

const addToWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!isValidProductId(productId)) return res.status(400).json({ message: "Invalid product ID" });

  try {
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) return res.status(404).json({ message: "Product not found" });

    const customer = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $addToSet: { wishlist: productId } },
      { new: true }
    );
    if (!customer) return res.status(409).json({ message: "Product is already in your wishlist" });

    return res.status(201).json({ success: true, message: "Product added to wishlist", count: customer.wishlist.length });
  } catch (error) {
    return res.status(500).json({ message: "Unable to add product to wishlist" });
  }
};

const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name description price category image stock createdAt",
    });
    if (!customer) return res.status(401).json({ message: "Unauthorized" });

    const wishlist = customer.wishlist.filter(Boolean);
    return res.status(200).json({ success: true, count: wishlist.length, wishlist });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load wishlist" });
  }
};

const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!isValidProductId(productId)) return res.status(400).json({ message: "Invalid product ID" });

  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } },
      { new: true }
    );
    if (!customer) return res.status(404).json({ message: "Product is not in your wishlist" });

    return res.status(200).json({ success: true, message: "Product removed from wishlist", count: customer.wishlist.length });
  } catch (error) {
    return res.status(500).json({ message: "Unable to remove product from wishlist" });
  }
};

const toggleWishlist = async (req, res) => {
  const { productId } = req.params;
  if (!isValidProductId(productId)) return res.status(400).json({ message: "Invalid product ID" });

  try {
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) return res.status(404).json({ message: "Product not found" });

    const customer = await Customer.findById(req.user._id);
    if (!customer) return res.status(401).json({ message: "Unauthorized" });
    const isSaved = customer.wishlist.some((id) => id.equals(productId));
    if (isSaved) customer.wishlist.pull(productId);
    else customer.wishlist.addToSet(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: isSaved ? "Product removed from wishlist" : "Product added to wishlist",
      saved: !isSaved,
      count: customer.wishlist.length,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update wishlist" });
  }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist, toggleWishlist };
