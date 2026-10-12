const bcrypt = require("bcrypt");
const Customer = require("../models/customer.model");
const generateToken = require("../utils/generateToken");

const isProduction = process.env.NODE_ENV === "production";
const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "strict",
};

const customerResponse = (customer) => ({
  _id: customer._id,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
});

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    ...authCookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const register = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingCustomer = await Customer.findOne({ email: normalizedEmail });

    if (existingCustomer) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: customerResponse(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Email already exists" });
    }

    return res.status(500).json({ message: "Unable to register customer" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const customer = await Customer.findOne({ email: email.trim().toLowerCase() }).select("+password");
    const isPasswordCorrect = customer && (await bcrypt.compare(password, customer.password));

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(customer._id);
    setAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      customer: customerResponse(customer),
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to log in" });
  }
};

const getMyProfile = (req, res) => res.status(200).json(customerResponse(req.user));

const logout = (req, res) => {
  res.clearCookie("token", authCookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Old password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const customer = await Customer.findById(req.user._id).select("+password");
    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, customer.password);

    if (!isOldPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    customer.password = await bcrypt.hash(newPassword, 10);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to change password" });
  }
};

module.exports = { register, login, getMyProfile, logout, changePassword };
