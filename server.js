
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./src/config/db.js";

import adminRoutes from "./src/routes/adminRoutes.js";
import merchantRoutes from "./src/routes/merchantRoutes.js";
import mallRoutes from "./src/routes/mallRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/merchant", merchantRoutes);

app.get("/", (req, res) => {
  res.send("Mall Backend Running Successfully!");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
