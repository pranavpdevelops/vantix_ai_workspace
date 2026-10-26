import express from "express";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../controller/projectcontroller.js";
import { protect } from "../middleware/authmiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getProjects);
router.post("/", createProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;