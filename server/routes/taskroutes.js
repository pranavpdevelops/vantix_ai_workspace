
import express from "express";

import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controller/taskcontroller.js";

import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTask);
router.get("/", getTasks);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
