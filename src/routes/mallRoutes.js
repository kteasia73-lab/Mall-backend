import express from "express";
import { getMallInfo } from "../controllers/mallController.js";

const router = express.Router();

router.get("/", getMallInfo);

export default router;
