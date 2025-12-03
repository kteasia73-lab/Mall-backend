import express from "express";
import { loginAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Admin login
router.post("/login", loginAdmin);

export default router;

// TEMPORARY: Reset admin password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const bcrypt = await import("bcryptjs");
    admin.password = await bcrypt.hash(password, 10);
    await admin.save();

    return res.status(200).json({ message: "Password successfully reset" });
  } catch (error) {
    console.error("Reset Password ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

