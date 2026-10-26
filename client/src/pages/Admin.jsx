
import { useEffect, useState } from "react";
import {
  Users,
  FolderKanban,
  CheckSquare,
  RefreshCw,
  Trash2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

import api from "../api";

function Admin() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  // Fetch dashboard data
  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/dashboard");

      setUsers(Array.isArray(data.users) ? data.users : []);
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (err) {
      console.error("Admin dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load admin data. Check your backend API routes and permissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get owner name
  const getOwner = (item) => {
    const owner =
      item.owner ||
      item.createdBy ||
      item.user ||
      item.assignedTo;

    if (typeof owner === "object" && owner !== null) {
      return owner.name || owner.email || "Unknown";
    }

    return "Unknown";
  };

  // Delete user
  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.name || user.email}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/admin/users/${user._id}`);

      setUsers((previous) =>
        previous.filter((item) => item._id !== user._id)
      );

      alert("User deleted successfully.");
    } catch (err) {
      console.error("Delete user error:", err);

      alert(
        err.response?.data?.message || "Failed to delete user."
      );
    }
  };

  // Delete project
  const deleteProject = async (project) => {
    const confirmed = window.confirm(
      `Delete project "${project.name || project.title}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/projects/${project._id}`);

      setProjects((previous) =>
        previous.filter((item) => item._id !== project._id)
      );

      alert("Project deleted successfully.");
    } catch (err) {
      console.error("Delete project error:", err);

      alert(
        err.response?.data?.message || "Failed to delete project."
      );
    }
  };

  // Delete task
  const deleteTask = async (task) => {
    const confirmed = window.confirm(
      `Delete task "${task.title}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(`/tasks/${task._id}`);

      setTasks((previous) =>
        previous.filter((item) => item._id !== task._id)
      );

      alert("Task deleted successfully.");
    } catch (err) {
      console.error("Delete task error:", err);

      alert(
        err.response?.data?.message || "Failed to delete task."
      );
    }
  };

  // Dashboard statistics
  const statCards = [
    {
      title: "Total Users",
      value: users.length,
      icon: Users,
      color: "bg-violet-100 text-violet-700",
    },
    {
      title: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Tasks",
      value: tasks.length,
      icon: CheckSquare,
      color: "bg-green-100 text-green-700",
    },
  ];

  // Tabs
  const tabs = [
    { id: "users", label: "Users", count: users.length },
    { id: "projects", label: "Projects", count: projects.length },
    { id: "tasks", label: "Tasks", count: tasks.length },
  ];

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <RefreshCw
          size={28}
          className="animate-spin text-violet-600"
        />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-violet-600">
            <ShieldCheck size={17} />
            Administrator workspace
          </div>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Monitor users, projects, and tasks across Vantix AI.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              Unable to load all dashboard data
            </p>

            <p className="mt-1">{error}</p>

            <button
              onClick={fetchData}
              className="mt-3 rounded-lg bg-amber-100 px-3 py-2 font-medium hover:bg-amber-200"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {card.value}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${card.color}`}>
                  <Icon size={23} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dashboard tables */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-100 p-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.id
                  ? "bg-violet-600 text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-violet-50 hover:text-violet-700"
              }`}
            >
              {tab.label}

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-white text-gray-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* USERS TABLE */}
        {activeTab === "users" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">User</th>
                  <th className="px-5 py-4 font-semibold">Email</th>
                  <th className="px-5 py-4 font-semibold">Role</th>
                  <th className="px-5 py-4 font-semibold">Account ID</th>
                  <th className="px-5 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.map((item) => (
                  <tr
                    key={item._id}
                    className="transition hover:bg-gray-50"
                  >
                    {/* User */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 font-semibold text-violet-700">
                          {(item.name || item.email || "U")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <span className="font-medium text-gray-900">
                          {item.name || "Unnamed user"}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 text-gray-600">
                      {item.email}
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.role === "admin"
                            ? "bg-violet-100 text-violet-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.role || "user"}
                      </span>
                    </td>

                    {/* Account ID */}
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">
                      {item._id}
                    </td>

                    {/* Delete user */}
                    <td className="px-5 py-4">
                      <button
                        onClick={() => deleteUser(item)}
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PROJECTS TABLE */}
        {activeTab === "projects" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Project</th>
                  <th className="px-5 py-4 font-semibold">Owner</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {projects.map((project) => (
                  <tr
                    key={project._id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">
                        {project.name ||
                          project.title ||
                          "Untitled project"}
                      </p>

                      <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                        {project.description || "No description"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {getOwner(project)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {project.status || "Not set"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => deleteProject(project)}
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {projects.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      No projects found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TASKS TABLE */}
        {activeTab === "tasks" && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Task</th>
                  <th className="px-5 py-4 font-semibold">Owner</th>
                  <th className="px-5 py-4 font-semibold">Priority</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">
                        {task.title || "Untitled task"}
                      </p>

                      <p className="mt-1 max-w-xs truncate text-xs text-gray-500">
                        {task.description || "No description"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {getOwner(task)}
                    </td>

                    <td className="px-5 py-4">
                      {task.priority || "Medium"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
                        {task.status || "Not set"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => deleteTask(task)}
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {tasks.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-5 py-12 text-center text-gray-500"
                    >
                      No tasks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
