
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  FolderKanban,
  ListTodo,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

import api from "../api";
import { useAuth } from "../context/authcontext";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || "");
  }
  return String(value);
};

const getName = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.fullName || value.username || value.email || "";
};

const getEmail = (value) => {
  if (!value) return "";
  if (typeof value === "string") return "";
  return value.email || "";
};

const getOwner = (item) =>
  item.owner || item.createdBy || item.user || item.assignedTo || null;

const getTaskProjectId = (task) =>
  getId(task.project || task.projectId || task.project?._id);

const getProjectTitle = (project) =>
  project.name || project.title || project.projectName || "Untitled project";

const getTaskTitle = (task) =>
  task.title || task.name || task.taskName || "Untitled task";

const getStatus = (item) =>
  String(item.status || "Planning").toLowerCase().replaceAll("_", " ");

const getProgress = (item) => {
  if (typeof item.progress === "number") {
    return Math.min(100, Math.max(0, Math.round(item.progress)));
  }

  const status = getStatus(item);

  if (["completed", "complete", "done"].includes(status)) return 100;
  if (["in progress", "in-progress", "ongoing", "active"].includes(status)) {
    return 50;
  }

  return 0;
};

const formatDate = (date) => {
  if (!date) return "No due date";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "No due date";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDate = (item) =>
  item.dueDate || item.deadline || item.endDate || item.updatedAt;

const statusStyle = (status) => {
  const value = String(status || "").toLowerCase();

  if (["completed", "complete", "done"].includes(value)) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-100";
  }

  if (
    value.includes("progress") ||
    value === "active" ||
    value === "ongoing"
  ) {
    return "bg-blue-50 text-blue-700 ring-blue-100";
  }

  if (value.includes("hold") || value.includes("block")) {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }

  return "bg-amber-50 text-amber-700 ring-amber-100";
};

const getInitials = (name) => {
  if (!name) return "U";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
};

function ProgressBar({ value = 0, color = "violet" }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  const colorClass =
    color === "emerald"
      ? "bg-emerald-500"
      : color === "blue"
        ? "bg-blue-500"
        : "bg-violet-600";

  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-gray-100"
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  description,
  count,
  action,
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <Icon size={21} />
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {count !== undefined && (
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
            {count} items
          </span>
        )}
        {action}
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-44 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-5 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-500 shadow-sm ring-1 ring-gray-100">
        <CircleDashed size={24} />
      </div>
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
    </div>
  );
}

function ProjectCard({ project, tasks }) {
  const projectId = getId(project);
  const relatedTasks = tasks.filter(
    (task) => getTaskProjectId(task) === projectId
  );

  const completedTasks = relatedTasks.filter((task) =>
    ["completed", "complete", "done"].includes(getStatus(task))
  ).length;

  const calculatedProgress =
    relatedTasks.length > 0
      ? Math.round((completedTasks / relatedTasks.length) * 100)
      : getProgress(project);

  const progress = Math.min(100, Math.max(0, calculatedProgress));

  const owner = getOwner(project);
  const ownerName =
    getName(owner) || project.ownerName || project.userName || "Unassigned";

  return (
    <article className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-100/60">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 text-violet-700 transition group-hover:from-violet-600 group-hover:to-indigo-600 group-hover:text-white">
          <FolderKanban size={23} />
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyle(project.status)}`}
        >
          {getStatus(project)}
        </span>
      </div>

      <h3 className="truncate text-base font-bold text-gray-900">
        {getProjectTitle(project)}
      </h3>

      <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-gray-500">
        {project.description || "No project description added yet."}
      </p>

      <div className="mt-5 flex items-center justify-between gap-3 text-xs text-gray-500">
        <span className="flex min-w-0 items-center gap-1.5">
          <Users size={14} className="shrink-0" />
          <span className="truncate">{ownerName}</span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5">
          <ListTodo size={14} />
          {relatedTasks.length} tasks
        </span>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            Project progress
          </span>
          <span className="text-sm font-extrabold text-violet-700">
            {progress}%
          </span>
        </div>

        <ProgressBar value={progress} />

        <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
          <span>
            {completedTasks} of {relatedTasks.length} completed
          </span>
          <span>{formatDate(getDate(project))}</span>
        </div>
      </div>
    </article>
  );
}

function TaskRow({ task }) {
  const progress = getProgress(task);
  const owner = getOwner(task);
  const projectName =
    typeof task.project === "object" && task.project
      ? getProjectTitle(task.project)
      : task.projectName || "No project";

  return (
    <div className="group grid grid-cols-1 gap-4 px-5 py-4 transition hover:bg-violet-50/40 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] sm:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            progress === 100
              ? "bg-emerald-50 text-emerald-600"
              : "bg-violet-50 text-violet-600"
          }`}
        >
          {progress === 100 ? (
            <CheckCircle2 size={18} />
          ) : (
            <ListTodo size={18} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">
            {getTaskTitle(task)}
          </p>
          <p className="mt-1 truncate text-xs text-gray-500">{projectName}</p>
        </div>
      </div>

      <div className="min-w-0">
        <span
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-inset ${statusStyle(task.status)}`}
        >
          {getStatus(task)}
        </span>

        <div className="mt-2 flex items-center gap-2">
          <div className="w-20">
            <ProgressBar value={progress} color={progress === 100 ? "emerald" : "violet"} />
          </div>
          <span className="text-xs font-bold text-gray-600">{progress}%</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:block">
        <div className="flex min-w-0 items-center gap-2 text-xs text-gray-500">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[10px] font-bold text-gray-600">
            {getInitials(getName(owner) || task.ownerName || "User")}
          </span>
          <span className="truncate">
            {getName(owner) || task.ownerName || "Unassigned"}
          </span>
        </div>

        <p className="mt-1 flex shrink-0 items-center gap-1.5 text-xs text-gray-400 sm:ml-9">
          <CalendarDays size={13} />
          {formatDate(getDate(task))}
        </p>
      </div>
    </div>
  );
}

function TaskList({ tasks, emptyTitle, emptyDescription }) {
  if (tasks.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)_minmax(0,0.8fr)] gap-4 border-b border-gray-100 bg-gray-50/80 px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 sm:grid">
        <span>Task / Project</span>
        <span>Status / Progress</span>
        <span>Owner / Due date</span>
      </div>

      <div className="divide-y divide-gray-100">
        {tasks.map((task, index) => (
          <TaskRow
            key={getId(task) || `${getTaskTitle(task)}-${index}`}
            task={task}
          />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const currentUserId = getId(user);
  const currentUserEmail = user?.email?.toLowerCase() || "";
  const currentUserName = user?.name?.toLowerCase() || "";
  const isAdmin = user?.role === "admin";

  const loadDashboard = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [projectResponse, taskResponse] = await Promise.all([
        api.get("/projects"),
        api.get("/tasks"),
      ]);

      const projectData = projectResponse.data;
      const taskData = taskResponse.data;

      const projectList = Array.isArray(projectData)
        ? projectData
        : projectData?.projects || projectData?.data || [];

      const taskList = Array.isArray(taskData)
        ? taskData
        : taskData?.tasks || taskData?.data || [];

      setProjects(Array.isArray(projectList) ? projectList : []);
      setTasks(Array.isArray(taskList) ? taskList : []);
    } catch (err) {
      console.error("Dashboard loading failed:", err);
      setError(
        err.response?.data?.message ||
          "Unable to load dashboard data. Check your server connection."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const belongsToCurrentUser = (item) => {
    const owner = getOwner(item);

    // Compare IDs when the API provides them.
    const ownerId = getId(owner);
    if (currentUserId && ownerId && ownerId === currentUserId) {
      return true;
    }

    // Also support APIs that return owner email/name rather than an ID.
    const ownerEmail = getEmail(owner).toLowerCase();
    const ownerName = getName(owner).toLowerCase();

    if (currentUserEmail && ownerEmail === currentUserEmail) return true;
    if (currentUserName && ownerName === currentUserName) return true;

    if (
      currentUserEmail &&
      String(item.ownerEmail || item.userEmail || "").toLowerCase() ===
        currentUserEmail
    ) {
      return true;
    }

    if (
      currentUserName &&
      String(item.ownerName || item.userName || "").toLowerCase() ===
        currentUserName
    ) {
      return true;
    }

    return false;
  };

  const myProjects = useMemo(
    () => projects.filter(belongsToCurrentUser),
    [projects, currentUserId, currentUserEmail, currentUserName]
  );

  const myTasks = useMemo(
    () => tasks.filter(belongsToCurrentUser),
    [tasks, currentUserId, currentUserEmail, currentUserName]
  );

  const completedTasks = tasks.filter((task) =>
    ["completed", "complete", "done"].includes(getStatus(task))
  ).length;

  const pendingTasks = tasks.length - completedTasks;

  const overallProgress =
    tasks.length > 0
      ? Math.round((completedTasks / tasks.length) * 100)
      : 0;

  const myCompletedTasks = myTasks.filter((task) =>
    ["completed", "complete", "done"].includes(getStatus(task))
  ).length;

  const myTaskProgress =
    myTasks.length > 0
      ? Math.round((myCompletedTasks / myTasks.length) * 100)
      : 0;

  const stats = [
    {
      title: "Total Projects",
      value: projects.length,
      subtitle: `${myProjects.length} assigned to you`,
      icon: FolderKanban,
      iconStyle: "bg-violet-100 text-violet-700",
      trendIcon: ArrowUpRight,
    },
    {
      title: "Total Tasks",
      value: tasks.length,
      subtitle: `${myTasks.length} assigned to you`,
      icon: ListTodo,
      iconStyle: "bg-blue-100 text-blue-700",
      trendIcon: Activity,
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      subtitle: `${overallProgress}% overall completion`,
      icon: CheckCircle2,
      iconStyle: "bg-emerald-100 text-emerald-700",
      trendIcon: ArrowUpRight,
    },
    {
      title: "Pending Tasks",
      value: pendingTasks,
      subtitle: "Tasks not yet completed",
      icon: Clock3,
      iconStyle: "bg-amber-100 text-amber-700",
      trendIcon: ArrowDownRight,
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-11 w-11 animate-spin rounded-full border-4 border-violet-100 border-t-violet-600" />
          <p className="text-sm font-medium text-gray-500">
            Preparing your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-10">
      {/* Welcome banner */}
      <section className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 px-6 py-8 text-white shadow-xl shadow-violet-200/50 sm:px-9 sm:py-10 lg:px-11">
        <div className="pointer-events-none absolute -right-12 -top-20 -z-10 h-64 w-64 rounded-full border-[40px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 -z-10 h-52 w-52 rounded-full bg-indigo-400/20 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-violet-50 backdrop-blur">
              <Sparkles size={14} />
              Your workspace at a glance
            </div>

            <p className="mb-2 text-sm font-medium text-violet-100">
              Welcome back,
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {user?.name || "Workspace member"}
              <span className="text-violet-200">.</span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-violet-100 sm:text-base">
              Keep your projects organized, track task progress, and make
              meaningful progress toward your goals.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15">
                <BriefcaseBusiness size={16} />
                {projects.length} projects
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm ring-1 ring-white/15">
                <CheckCircle2 size={16} />
                {completedTasks} tasks completed
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur">
              <p className="text-xs font-medium text-violet-100">
                Overall completion
              </p>
              <p className="mt-1 text-4xl font-extrabold">
                {overallProgress}%
              </p>
              <div className="mt-3 h-1.5 w-36 max-w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white transition-all"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-violet-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            className="shrink-0 rounded-lg bg-white px-4 py-2 font-semibold text-red-700 ring-1 ring-red-100 transition hover:bg-red-100"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trendIcon;

          return (
            <article
              key={stat.title}
              className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-100 hover:shadow-lg hover:shadow-violet-100/50 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.iconStyle}`}
                >
                  <Icon size={22} />
                </div>
                <TrendIcon
                  size={18}
                  className="text-gray-300 transition group-hover:text-violet-500"
                />
              </div>

              <p className="mt-5 text-sm font-medium text-gray-500">
                {stat.title}
              </p>

              <div className="mt-1 flex items-end justify-between gap-3">
                <p className="text-3xl font-extrabold tracking-tight text-gray-900">
                  {stat.value}
                </p>
              </div>

              <p className="mt-2 text-xs text-gray-400">{stat.subtitle}</p>
            </article>
          );
        })}
      </section>

      
      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Workspace progress
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Completion across all tasks available to you
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
              <Activity size={21} />
            </div>
          </div>

          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="text-4xl font-extrabold tracking-tight text-gray-900">
                {overallProgress}%
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Overall task completion
              </p>
            </div>

            <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
              {completedTasks} completed
            </span>
          </div>

          <ProgressBar value={overallProgress} />

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-emerald-50/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={17} />
                <span className="text-xs font-semibold">Completed</span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {completedTasks}
              </p>
            </div>

            <div className="rounded-xl bg-amber-50/70 p-4">
              <div className="mb-2 flex items-center gap-2 text-amber-700">
                <Clock3 size={17} />
                <span className="text-xs font-semibold">Remaining</span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {pendingTasks}
              </p>
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Your progress</h2>
              <p className="mt-1 text-sm text-gray-500">
                Your assigned tasks only
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <CheckCircle2 size={21} />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-violet-50">
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  background: `conic-gradient(#7c3aed ${myTaskProgress * 3.6}deg, #ede9fe 0deg)`,
                }}
              />
              <div className="absolute inset-[13px] flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-2xl font-extrabold text-gray-900">
                  {myTaskProgress}%
                </span>
                <span className="text-[10px] font-medium text-gray-400">
                  Complete
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-3">
              <div>
                <p className="text-xs text-gray-500">My tasks</p>
                <p className="text-xl font-bold text-gray-900">
                  {myTasks.length}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">My projects</p>
                <p className="text-xl font-bold text-gray-900">
                  {myProjects.length}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-violet-100 bg-violet-50/60 p-4">
            <p className="text-sm font-semibold text-violet-900">
              Keep up the momentum!
            </p>
            <p className="mt-1 text-xs leading-5 text-violet-700">
              {myTasks.length === 0
                ? "You have no tasks assigned to you yet."
                : `${myCompletedTasks} of ${myTasks.length} of your tasks are completed.`}
            </p>
          </div>
        </article>
      </section>

      <section>
        <SectionHeader
          icon={FolderKanban}
          title="My Projects"
          description="Projects assigned to or created by you"
          count={myProjects.length}
        />

        {myProjects.length === 0 ? (
          <EmptyState
            title="No personal projects found"
            description="Projects associated with your account will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {myProjects.map((project, index) => (
              <ProjectCard
                key={getId(project) || `my-project-${index}`}
                project={project}
                tasks={tasks}
              />
            ))}
          </div>
        )}
      </section>

      
      <section>
        <SectionHeader
          icon={BriefcaseBusiness}
          title="All Projects"
          description="Every project returned by your account's API permissions"
          count={projects.length}
        />

        {projects.length === 0 ? (
          <EmptyState
            title="No projects available"
            description="Create a project to start organizing your work."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard
                key={getId(project) || `all-project-${index}`}
                project={project}
                tasks={tasks}
              />
            ))}
          </div>
        )}
      </section>

  
      <section>
        <SectionHeader
          icon={CheckCircle2}
          title="My Tasks"
          description="Tasks assigned to or created by you"
          count={myTasks.length}
        />

        <TaskList
          tasks={myTasks}
          emptyTitle="No personal tasks found"
          emptyDescription="Your assigned tasks will appear here when available."
        />
      </section>

      
      <section>
        <SectionHeader
          icon={ListTodo}
          title="All Tasks"
          description="Tasks returned by your account's API permissions"
          count={tasks.length}
        />

        <TaskList
          tasks={tasks}
          emptyTitle="No tasks available"
          emptyDescription="Tasks created in your workspace will appear here."
        />
      </section>

   
      <footer className="flex flex-col gap-2 border-t border-gray-100 pt-5 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Vantix AI. Project management made
          simpler.
        </p>
        <p className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Workspace dashboard
          {isAdmin && (
            <span className="ml-2 rounded-full bg-violet-50 px-2 py-1 font-semibold text-violet-700">
              Admin
            </span>
          )}
          <ArrowRight size={13} className="ml-1" />
        </p>
      </footer>
    </div>
  );
}
