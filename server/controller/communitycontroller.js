import User from "../model/User.js";
import Project from "../model/Project.js";
import Task from "../model/Task.js";

export const getCommunityData = async (req, res) => {
  try {
    const [users, projects, tasks] = await Promise.all([
      User.find().select("name email role"),
      Project.find().populate("owner", "name email"),
      Task.find()
        .populate("owner", "name email")
        .populate("project", "name"),
    ]);

    res.status(200).json({
      users,
      projects,
      tasks,
    });
  } catch (error) {
    console.error("Community error:", error);

    res.status(500).json({
      message: "Failed to load community data",
    });
  }
};