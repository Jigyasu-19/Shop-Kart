const express = require("express");
const { createProduct, getProducts, getProductById } = require("../controllers/product.controller");

const router = express.Router();

router.route("/").post(createProduct).get(getProducts);
router.get("/:id", getProductById);

module.exports = router;
