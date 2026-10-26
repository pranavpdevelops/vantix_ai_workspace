import express from "express";
import { getCommunityData } from "../controller/communitycontroller.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/", protect, getCommunityData);

export default router;