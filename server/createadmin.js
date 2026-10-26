import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./model/User.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);

    const email = "admin@vantix.com";
    const existingAdmin = await User.findOne({ email });

    if (existingAdmin) {
      existingAdmin.role = "admin";
      await existingAdmin.save();

      console.log("Existing account promoted to admin");
    } else {
      const password = "Admin@123456";

      const hashedPassword = await bcrypt.hash(password, 10);

      await User.create({
        name: "Vantix Admin",
        email,
        password: hashedPassword,
        role: "admin",
      });

      console.log("Admin account created");
    }

    console.log("Email: admin@vantix.com");
    console.log("Password: Admin@123456");
  } catch (error) {
    console.error("Admin creation error:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();