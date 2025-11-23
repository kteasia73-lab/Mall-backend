
// src/routes/adminRoutes.js
import express from "express";
import {
  createAdmin,
  loginAdmin,
  getAdmins,
} from "../controllers/adminController.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public (for now – you may later lock createAdmin)
router.post("/create", createAdmin);
router.post("/login", loginAdmin);

// Protected – only logged-in admins can see admin list
router.get("/", requireAdmin, getAdmins);

export default router;

