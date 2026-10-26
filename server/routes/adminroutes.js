import express from "express";
import { getAdminDashboard , deleteUser } from "../controller/admincontroller.js";
import {
  protect,
  adminOnly,
} from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminDashboard);
router.delete("/users/:id", protect, adminOnly, deleteUser);

export default router;