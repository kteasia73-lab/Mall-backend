// src/controllers/merchantController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Merchant from "../models/Merchant.js";

const signToken = (merchantId) => {
  return jwt.sign(
    { id: merchantId, role: "merchant" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/merchant/register
export const registerMerchant = async (req, res) => {
  try {
    const { name, email, password, storeName, phone } = req.body;

    if (!name || !email || !password || !storeName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await Merchant.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Merchant already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const merchant = await Merchant.create({
      name,
      email,
      password: hashedPassword,
      storeName,
      phone,
    });

    const token = signToken(merchant._id);

    res.status(201).json({
      message: "Merchant registered successfully",
      token,
      merchant: {
        id: merchant._id,
        name: merchant.name,
        email: merchant.email,
        storeName: merchant.storeName,
        status: merchant.status,
      },
    });
  } catch (err) {
    console.error("registerMerchant error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/merchant/login
export const loginMerchant = async (req, res) => {
  try {
    const { email, password } = req.body;

    const merchant = await Merchant.findOne({ email });
    if (!merchant) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    const isMatch = await bcrypt.compare(password, merchant.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signToken(merchant._id);

    res.json({
      message: "Login successful",
      token,
      merchant: {
        id: merchant._id,
        name: merchant.name,
        email: merchant.email,
        storeName: merchant.storeName,
        status: merchant.status,
      },
    });
  } catch (err) {
    console.error("loginMerchant error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/merchant/me  (protected)
export const getMerchantProfile = async (req, res) => {
  try {
    const merchant = await Merchant.findById(req.merchant._id).select(
      "-password"
    );
    res.json(merchant);
  } catch (err) {
    console.error("getMerchantProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
