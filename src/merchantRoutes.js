// src/routes/merchantRoutes.js
import express from "express";
import {
  registerMerchant,
  loginMerchant,
  getMerchantProfile,
} from "../controllers/merchantController.js";
import { requireMerchant } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.post("/register", registerMerchant);
router.post("/login", loginMerchant);

// Private (merchant only)
router.get("/me", requireMerchant, getMerchantProfile);

export default router;
