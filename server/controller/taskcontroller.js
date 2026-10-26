import Task from "../model/Task.js";
import Project from "../model/Project.js";

const isAdmin = (user) => user.role === "admin";

const canManage = (task, user) => {
  return (
    isAdmin(user) ||
    task.owner.toString() === user._id.toString()
  );
};

const populateTask = (query) =>
  query
    .populate("owner", "name email")
    .populate({
      path: "project",
      select: "name owner",
      populate: {
        path: "owner",
        select: "name email",
      },
    });

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
    } = req.body;

    if (!title?.trim() || !projectId) {
      return res.status(400).json({
        message: "Task title and project are required",
      });
    }


    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description || "",
      status: status || "To Do",
      priority: priority || "Medium",
      dueDate: dueDate || null,
      project: project._id,
      owner: req.user._id,
    });

    const populatedTask = await populateTask(
      Task.findById(task._id)
    );

    return res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Create task error:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};


export const getTasks = async (req, res) => {
  try {
    const filter = {};

    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }

    const tasks = await populateTask(
      Task.find(filter).sort({ createdAt: -1 })
    );

    return res.status(200).json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);

    return res.status(500).json({
      message: "Failed to retrieve tasks",
    });
  }
};


export const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (!canManage(task, req.user)) {
      return res.status(403).json({
        message: "You cannot edit this task",
      });
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          message: "Task title cannot be empty",
        });
      }

      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (status !== undefined) {
      task.status = status;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate || null;
    }

    if (projectId !== undefined) {
      const project = await Project.findById(projectId);

      if (!project) {
        return res.status(404).json({
          message: "Project not found",
        });
      }

      task.project = project._id;
    }

   
    await task.save();

    const updatedTask = await populateTask(
      Task.findById(task._id)
    );

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error("Update task error:", error);

    return res.status(400).json({
      message: error.message,
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (!canManage(task, req.user)) {
      return res.status(403).json({
        message: "You cannot delete this task",
      });
    }

    await task.deleteOne();

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete task error:", error);

    return res.status(500).json({
      message: "Failed to delete task",
    });
  }
};