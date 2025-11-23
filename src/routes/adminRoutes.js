import express from "express";
import {
  createAdmin,
  loginAdmin,
  getAdmins
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/create", createAdmin);
router.post("/login", loginAdmin);
router.get("/", getAdmins);

export default router;

