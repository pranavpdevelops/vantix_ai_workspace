import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckCircle2,
  Clock3,
  CircleAlert,
  ArrowUpRight,
  Plus,
  Sparkles,
  CalendarDays,
  ListTodo,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../context/authcontext";
import api from "../api";
import Sidebar from "../components/SideBar";

function Dashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch projects and tasks
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectRes, taskRes] = await Promise.all([
        api.get("/projects"),
        api.get("/tasks"),
      ]);

      const projectData = projectRes.data;
      const taskData = taskRes.data;

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
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Normalize status values
  const normalizeStatus = (status = "") =>
    String(status).toLowerCase().replace(/[\s_-]/g, "");

  const isCompleted = (task) =>
    ["completed", "complete", "done"].includes(
      normalizeStatus(task.status)
    );

  const isInProgress = (task) =>
    ["inprogress", "progress"].includes(
      normalizeStatus(task.status)
    );

  const isTodo = (task) =>
    ["todo", "pending", "planning"].includes(
      normalizeStatus(task.status)
    );

  // Task statistics
  const completedTasks = tasks.filter(isCompleted).length;
  const inProgressTasks = tasks.filter(isInProgress).length;
  const todoTasks = tasks.filter(isTodo).length;

  const overdueTasks = tasks.filter((task) => {
    if (!task.dueDate || isCompleted(task)) return false;

    const dueDate = new Date(task.dueDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return (
      !Number.isNaN(dueDate.getTime()) &&
      dueDate < today
    );
  }).length;

  // Active projects
  const activeProjects = projects.filter(
    (project) =>
      !["completed", "complete", "done"].includes(
        normalizeStatus(project.status)
      )
  );

  // Get project ID from a task
  const getProjectId = (task) => {
    if (typeof task.project === "string") {
      return task.project;
    }

    if (task.project?._id) {
      return task.project._id;
    }

    if (task.projectId) {
      return task.projectId;
    }

    return "";
  };

  // Get project name
  const getProjectName = (task) => {
    if (task.project && typeof task.project === "object") {
      return (
        task.project.name ||
        task.project.title ||
        "Project"
      );
    }

    const project = projects.find(
      (item) => item._id === getProjectId(task)
    );

    return project?.name || project?.title || "General";
  };

  // Get tasks belonging to a project
  const getProjectTasks = (project) =>
    tasks.filter(
      (task) => getProjectId(task) === project._id
    );

  // Calculate project progress
  const getProjectProgress = (project) => {
    const projectTasks = getProjectTasks(project);

    if (projectTasks.length === 0) {
      return normalizeStatus(project.status) === "completed"
        ? 100
        : 0;
    }

    const completed = projectTasks.filter(isCompleted).length;

    return Math.round(
      (completed / projectTasks.length) * 100
    );
  };

  // Latest five tasks
  const recentTasks = [...tasks]
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  // Dashboard statistics
  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      detail: `${activeProjects.length} active projects`,
      icon: FolderKanban,
      style: "bg-violet-100 text-violet-600",
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      detail: "Tasks finished",
      icon: CheckCircle2,
      style: "bg-emerald-100 text-emerald-600",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      detail: "Tasks underway",
      icon: Clock3,
      style: "bg-blue-100 text-blue-600",
    },
    {
      title: "Overdue Tasks",
      value: overdueTasks,
      detail: "Past due date",
      icon: CircleAlert,
      style: "bg-rose-100 text-rose-600",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] text-[#17172B] md:flex">
      {/* Responsive sidebar */}
      <Sidebar />

      {/* Main dashboard */}
      <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Header */}
        <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-400">
              Workspace /{" "}
              <span className="text-violet-600">
                Dashboard
              </span>
            </p>

            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your projects today.
            </p>
          </div>

          <Link
            to="/projects"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700"
          >
            <Plus size={18} />
            New Project
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>

            <button
              type="button"
              onClick={fetchDashboard}
              className="inline-flex items-center gap-2 font-semibold underline"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Welcome section */}
        <section className="relative mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-500 p-6 text-white sm:p-8 lg:p-10">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
              <Sparkles size={14} />
              YOUR WORKSPACE
            </span>

            <h2 className="mt-5 text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
              Hello, {(user?.name || "there").toUpperCase()}..!
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
              Manage your projects, track your tasks, and keep
              your team moving forward — all in one place.
            </p>
          </div>

          <div className="pointer-events-none absolute -right-10 -top-16 hidden h-64 w-64 rounded-full border border-white/15 sm:block lg:right-10">
            <div className="absolute inset-8 rounded-full border border-white/15" />

            <div className="absolute inset-16 rounded-full border border-white/20" />

            <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
              <Sparkles size={32} />
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="mb-7">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Overview</h2>

            <span className="text-xs text-gray-400">
              Live statistics
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.title}
                  className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </p>

                      <h3 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                        {loading ? "—" : stat.value}
                      </h3>
                    </div>

                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.style}`}
                    >
                      <Icon size={21} />
                    </span>
                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    {stat.detail}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        {/* Projects and productivity insights */}
        <div className="mb-7 grid grid-cols-1 items-start gap-5 xl:grid-cols-2">
          {/* Active projects */}
          <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">
                  Active Projects
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Keep track of your progress
                </p>
              </div>

              <Link
                to="/projects"
                className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                View all <ArrowUpRight size={15} />
              </Link>
            </div>

            {loading ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Loading projects...
              </p>
            ) : activeProjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center">
                <FolderKanban
                  size={30}
                  className="mx-auto text-gray-300"
                />

                <p className="mt-3 font-semibold text-gray-700">
                  No active projects
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Create a project to get started.
                </p>

                <Link
                  to="/projects"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
                >
                  <Plus size={16} />
                  Create Project
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {activeProjects.slice(0, 4).map((project) => {
                  const progress = getProjectProgress(project);
                  const projectTasks = getProjectTasks(project);

                  return (
                    <div
                      key={project._id}
                      className="min-w-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                          <FolderKanban size={19} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <h3 className="break-words text-sm font-semibold text-gray-800">
                              {project.name ||
                                project.title ||
                                "Untitled Project"}
                            </h3>

                            <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600">
                              {project.status || "Active"}
                            </span>
                          </div>

                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-400">
                            {project.description ||
                              "No description provided."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                        <span className="text-gray-500">
                          {projectTasks.filter(isCompleted).length} of{" "}
                          {projectTasks.length} tasks completed
                        </span>

                        <span className="font-semibold text-gray-700">
                          {progress}%
                        </span>
                      </div>

                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-violet-500 transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Productivity insights */}
          <section className="min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold">
                Productivity Insights
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                Your current work at a glance
              </p>
            </div>

            <div className="space-y-4">
              {/* Completed tasks */}
              <div className="flex items-center gap-4 rounded-xl bg-emerald-50/70 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={22} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Completed tasks
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {completedTasks} tasks finished
                  </p>
                </div>

                <span className="text-lg font-bold text-emerald-600">
                  {tasks.length
                    ? Math.round(
                        (completedTasks / tasks.length) * 100
                      )
                    : 0}
                  %
                </span>
              </div>

              {/* In progress */}
              <div className="flex items-center gap-4 rounded-xl bg-blue-50/70 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <Clock3 size={22} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    In progress
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Tasks currently underway
                  </p>
                </div>

                <span className="text-lg font-bold text-blue-600">
                  {inProgressTasks}
                </span>
              </div>

              {/* Pending tasks */}
              <div className="flex items-center gap-4 rounded-xl bg-amber-50/70 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <CalendarDays size={22} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Pending tasks
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Tasks waiting to be started
                  </p>
                </div>

                <span className="text-lg font-bold text-amber-600">
                  {todoTasks}
                </span>
              </div>

              {/* Overdue tasks */}
              <div className="flex items-center gap-4 rounded-xl bg-rose-50/70 p-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <CircleAlert size={22} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Overdue tasks
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Tasks past their due date
                  </p>
                </div>

                <span className="text-lg font-bold text-rose-600">
                  {overdueTasks}
                </span>
              </div>
            </div>

            {/* AI Assistant link */}
            <Link
              to="/ai"
              className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 p-4 text-white transition hover:shadow-lg"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                  <Sparkles size={21} />
                </span>

                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    Need a productivity boost?
                  </p>

                  <p className="mt-1 text-xs text-white/75">
                    Ask your AI assistant for help.
                  </p>
                </div>
              </div>

              <ArrowUpRight size={19} className="shrink-0" />
            </Link>
          </section>
        </div>

        {/* Recent tasks */}
        <section className="mb-7 min-w-0 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">
                Recent Tasks
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                The latest tasks in your workspace
              </p>
            </div>

            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700"
            >
              View all <ArrowUpRight size={15} />
            </Link>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Loading tasks...
            </p>
          ) : recentTasks.length === 0 ? (
            <div className="py-10 text-center">
              <ListTodo
                size={30}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 font-semibold text-gray-700">
                No tasks yet
              </p>

              <p className="mt-1 text-sm text-gray-400">
                Your recent tasks will appear here.
              </p>

              <Link
                to="/tasks"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <Plus size={16} />
                Create Task
              </Link>
            </div>
          ) : (
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-400">
                    <th className="px-3 py-3 font-semibold">
                      Task
                    </th>

                    <th className="px-3 py-3 font-semibold">
                      Project
                    </th>

                    <th className="px-3 py-3 font-semibold">
                      Priority
                    </th>

                    <th className="px-3 py-3 font-semibold">
                      Status
                    </th>

                    <th className="px-3 py-3 font-semibold">
                      Due date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentTasks.map((task) => {
                    const priority = (
                      task.priority || "Medium"
                    ).toLowerCase();

                    const status = task.status || "To Do";

                    const priorityStyle = {
                      high: "bg-rose-50 text-rose-600",
                      medium: "bg-amber-50 text-amber-600",
                      low: "bg-emerald-50 text-emerald-600",
                    };

                    const statusStyle = isCompleted(task)
                      ? "bg-emerald-50 text-emerald-600"
                      : isInProgress(task)
                        ? "bg-blue-50 text-blue-600"
                        : "bg-gray-100 text-gray-600";

                    return (
                      <tr
                        key={task._id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50/70"
                      >
                        <td className="max-w-xs px-3 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${
                                isCompleted(task)
                                  ? "bg-emerald-500"
                                  : isInProgress(task)
                                    ? "bg-blue-500"
                                    : "bg-amber-400"
                              }`}
                            />

                            <span className="break-words font-medium text-gray-800">
                              {task.title ||
                                task.name ||
                                "Untitled Task"}
                            </span>
                          </div>
                        </td>

                        <td className="px-3 py-4 text-gray-500">
                          {getProjectName(task)}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                              priorityStyle[priority] ||
                              priorityStyle.medium
                            }`}
                          >
                            {priority}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle}`}
                          >
                            {status}
                          </span>
                        </td>

                        <td className="px-3 py-4 text-gray-500">
                          {task.dueDate
                            ? new Date(
                                task.dueDate
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col items-center justify-between gap-2 pb-3 text-center text-xs text-gray-400 sm:flex-row sm:text-left">
          <p>© 2026 Vantix AI. All rights reserved.</p>

          <p className="flex items-center gap-1">
            Built for better productivity
            <Sparkles size={13} />
          </p>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;