import express from "express";
import { loginAdmin, createAdmin } from "../controllers/adminController.js";

const router = express.Router();

// Admin login
router.post("/login", loginAdmin);

// TEMPORARY: Create admin account
router.post("/create", createAdmin);

export default router;
