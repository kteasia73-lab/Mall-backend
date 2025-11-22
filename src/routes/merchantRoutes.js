import express from "express";
import { getMerchantInfo } from "../controllers/merchantController.js";

const router = express.Router();

router.get("/", getMerchantInfo);

export default router;
