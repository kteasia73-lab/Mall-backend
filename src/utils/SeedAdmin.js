import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const exists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });

  if (!exists) {
    await Admin.create({
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD
    });
    console.log("Admin created!");
  } else {
    console.log("Admin already exists.");
  }

  process.exit();
});
