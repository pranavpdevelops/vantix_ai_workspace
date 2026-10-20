import express from "express";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../controller/projectcontroller.js";

import authMiddleware from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createProject);
router.get("/", getProjects);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

export default router;