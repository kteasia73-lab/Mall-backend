import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================================
//  ADMIN LOGIN CONTROLLER
// ================================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", email);

    // 1. Check if admin exists
    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log("Admin NOT FOUND:", email);
      return res.status(404).json({ message: "Admin not found" });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      console.log("WRONG PASSWORD for:", email);
      return res.status(400).json({ message: "Incorrect password" });
    }

    // 3. Create JWT token
    const token = jwt.sign(
      {
        id: admin._id,
        role: admin.role,
        email: admin.email
      },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    console.log("SUCCESSFUL LOGIN:", admin.email);

    // 4. Send success
    return res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        role: admin.role
      }
    });

  } catch (error) {
    console.error("Admin Login ERROR:", error);
    return res.status(500).json({ message: "Server error" });
  }
};


// ================================
//  (OPTIONAL) CREATE ADMIN
// ================================
// Use this if you want to create admins from backend later
export const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new Admin({
      email,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    res.status(201).json({ message: "Admin created", admin });
  } catch (error) {
    console.error("Create Admin ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
