
import User from "../model/User.js";
import Project from "../model/Project.js";
import Task from "../model/Task.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const [users, projects, tasks] = await Promise.all([
      User.find().select("-password"),
      Project.find()
        .populate("owner", "name email")
        .sort({ createdAt: -1 }),
      Task.find()
        .populate("owner", "name email")
        .populate({
          path: "project",
          select: "name owner",
          populate: {
            path: "owner",
            select: "name email",
          },
        })
        .sort({ createdAt: -1 }),
    ]);

    return res.status(200).json({
      users,
      projects,
      tasks,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      message: "Failed to load admin dashboard data",
    });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

   
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        message: "You cannot delete your own account.",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Failed to delete user.",
    });
  }
};