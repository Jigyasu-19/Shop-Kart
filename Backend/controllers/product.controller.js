const mongoose = require("mongoose");
const Product = require("../models/product.model");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;
    if (!name || !description || price === undefined || !category || !image || stock === undefined) {
      return res.status(400).json({ message: "Name, description, price, category, image and stock are required" });
    }

    const product = await Product.create({ name, description, price, category, image, stock });
    return res.status(201).json({ success: true, product });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Unable to create product" });
  }
};

const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    const query = {};
    if (search?.trim()) query.name = { $regex: escapeRegex(search.trim()), $options: "i" };
    if (category?.trim()) query.category = { $regex: `^${escapeRegex(category.trim())}$`, $options: "i" };

    const sortOption = sort === "price_asc" ? { price: 1 } : sort === "price_desc" ? { price: -1 } : {};
    const products = await Product.find(query)
      .select("name description price category image stock createdAt")
      .sort(sortOption)
      .lean();
    return res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load products" });
  }
};

const getProductById = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    const product = await Product.findById(req.params.id)
      .select("name description price category image stock createdAt")
      .lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load product" });
  }
};

module.exports = { createProduct, getProducts, getProductById };
