const jwt = require("jsonwebtoken");

const generateToken = (customerId) =>
  jwt.sign({ customerId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

module.exports = generateToken;
