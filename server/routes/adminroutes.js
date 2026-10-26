import express from "express";
import { getAdminDashboard } from "../controller/admincontroller.js";
import {
  protect,
  adminOnly,
} from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, adminOnly, getAdminDashboard);

export default router;