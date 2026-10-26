import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "../controller/taskcontroller.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;