import User from "../model/User.js";
import Project from "../model/Project.js";
import Task from "../model/Task.js";

// Only use this controller behind protect + adminOnly.
export const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAdmins,
      totalProjects,
      totalTasks,
      users,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "admin" }),
      Project.countDocuments(),
      Task.countDocuments(),
      User.find()
        .select("name email role createdAt")
        .sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        totalAdmins,
        totalProjects,
        totalTasks,
      },
      users,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      message: "Failed to load admin dashboard",
    });
  }
};