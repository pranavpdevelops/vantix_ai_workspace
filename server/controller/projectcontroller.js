import Project from "../model/Project.js";

const isAdmin = (user) => user.role === "admin";

const canManage = (project, user) => {
  return (
    isAdmin(user) ||
    project.owner.toString() === user._id.toString()
  );
};

// Create project
export const createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name: name.trim(),
      description: description || "",
      status,
      owner: req.user._id,
    });

    const populatedProject = await Project.findById(project._id)
      .populate("owner", "name email");

    return res.status(201).json(populatedProject);
  } catch (error) {
    console.error("Create project error:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};

// Get ALL projects
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json(projects);
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      message: "Failed to retrieve projects",
    });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!canManage(project, req.user)) {
      return res.status(403).json({
        message: "You cannot edit this project",
      });
    }

    const { name, description, status } = req.body;

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Project name cannot be empty",
        });
      }

      project.name = name.trim();
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (status !== undefined) {
      project.status = status;
    }

    // Ownership cannot be changed through this endpoint.
    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate("owner", "name email");

    return res.status(200).json(updatedProject);
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!canManage(project, req.user)) {
      return res.status(403).json({
        message: "You cannot delete this project",
      });
    }

    // Remove associated tasks as well.
    const { default: Task } = await import("../model/Task.js");

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    return res.status(200).json({
      message: "Project and its tasks deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      message: "Failed to delete project",
    });
  }
};