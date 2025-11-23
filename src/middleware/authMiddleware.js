// src/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import Merchant from "../models/Merchant.js";

const getTokenFromHeader = (req) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
};

// Generic auth – any logged in user (admin or merchant)
export const requireAuth = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Admin-only
export const requireAdmin = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    req.admin = admin;
    next();
  });
};

// Merchant-only
export const requireMerchant = async (req, res, next) => {
  await requireAuth(req, res, async () => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ message: "Merchant access only" });
    }

    const merchant = await Merchant.findById(req.user.id).select("-password");
    if (!merchant) {
      return res.status(401).json({ message: "Merchant not found" });
    }

    req.merchant = merchant;
    next();
  });
};
