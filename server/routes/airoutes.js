import express from "express";
import { askAI } from "../controller/aicontroller.js";

const router = express.Router();

router.post("/chat", askAI);

export default router;