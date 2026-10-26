
import { useEffect, useState } from "react";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  ListTodo,
  ArrowUpRight,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import api from "../api";
import { useAuth } from "../context/authcontext";

export default function Dashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch all projects and tasks visible to the logged-in user.
      const [projectResponse, taskResponse] = await Promise.all([
        api.get("/projects"),
        api.get("/tasks"),
      ]);

      const projectData = projectResponse.data;
      const taskData = taskResponse.data;

      // Supports either an array or an object containing an array.
      setProjects(
        Array.isArray(projectData)
          ? projectData
          : projectData.projects || []
      );

      setTasks(
        Array.isArray(taskData)
          ? taskData
          : taskData.tasks || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const isCompleted = (task) =>
    String(task.status || "").toLowerCase() === "completed";

  const completedTasks = tasks.filter(isCompleted).length;
  const pendingTasks = tasks.length - completedTasks;

  const completionPercentage =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const getOwnerName = (item) => {
    const owner =
      item.owner ||
      item.createdBy ||
      item.user;

    if (typeof owner === "string") {
      return owner;
    }

    return owner?.name || item.ownerName || "Unknown";
  };

  const getProjectName = (task) => {
    if (typeof task.project === "object") {
      return task.project?.name || task.project?.title || "Project";
    }

    return task.projectName || "Project";
  };

  const formatDate = (date) => {
    if (!date) return "No due date";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "No due date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: FolderKanban,
      color: "bg-violet-100 text-violet-700",
    },
    {
      title: "Total Tasks",
      value: tasks.length,
      icon: ListTodo,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      icon: CheckCircle2,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Pending Tasks",
      value: pendingTasks,
      icon: Clock,
      color: "bg-orange-100 text-orange-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-violet-600"
          />
          <p className="mt-3 text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-violet-600">
            WORKSPACE OVERVIEW
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Welcome back, {user?.name || "there"}!
          </h1>

          <p className="mt-2 text-gray-500">
            Here's what's happening with your projects today.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>

          <button
            onClick={fetchDashboard}
            className="mt-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`rounded-xl p-3 ${stat.color}`}
                >
                  <Icon size={23} />
                </div>

                <ArrowUpRight
                  size={20}
                  className="text-gray-400"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500">
                {stat.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {stat.value}
              </h2>
            </div>
          );
        })}
      </div>

      {/* Progress */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Task completion
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Overall progress across visible tasks
            </p>
          </div>

          <span className="text-2xl font-bold text-violet-700">
            {completionPercentage}%
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="mt-3 flex justify-between text-sm text-gray-500">
          <span>{completedTasks} completed</span>
          <span>{pendingTasks} remaining</span>
        </div>
      </section>

      {/* Recent projects and tasks */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Recent projects */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Recent Projects
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Projects in your workspace
              </p>
            </div>

            <FolderKanban
              size={22}
              className="text-violet-600"
            />
          </div>

          {projects.length === 0 ? (
            <div className="rounded-xl bg-gray-50 py-10 text-center">
              <FolderKanban
                size={32}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-medium text-gray-600">
                No projects yet
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Create a project to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project._id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-4 transition hover:border-violet-200 hover:bg-violet-50/40"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-violet-100 p-3 text-violet-700">
                      <FolderKanban size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-800">
                        {project.name || project.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        Owner: {getOwnerName(project)}
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                    {project.status || "Active"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent tasks */}
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Recent Tasks
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Tasks across your workspace
              </p>
            </div>

            <ListTodo
              size={22}
              className="text-violet-600"
            />
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-xl bg-gray-50 py-10 text-center">
              <ListTodo
                size={32}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-medium text-gray-600">
                No tasks yet
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Your tasks will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  className="rounded-xl border border-gray-100 p-4 transition hover:border-violet-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-800">
                        {task.title || task.name}
                      </h3>

                      <p className="mt-1 text-xs text-gray-500">
                        {getProjectName(task)}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                        isCompleted(task)
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {task.status || "Pending"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                    <span>Owner: {getOwnerName(task)}</span>

                    <span className="flex items-center gap-1">
                      <CalendarDays size={13} />
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}