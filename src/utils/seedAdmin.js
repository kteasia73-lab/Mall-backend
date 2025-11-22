import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Admin from "../models/Admin.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("Connected to MongoDB — seeding admin...");

    const adminExists = await Admin.findOne({ email: "admin@mall.com" });
    if (adminExists) {
      console.log("Admin already exists.");
      process.exit();
    }

    const hashed = await bcrypt.hash("password123", 10);

    await Admin.create({
      email: "admin@mall.com",
      password: hashed,
    });

    console.log("Admin created: admin@mall.com / password123");
    process.exit();
  })
  .catch((err) => console.error(err));
