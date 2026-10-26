import { useEffect, useState } from "react";
import {
  Circle,
  Clock,
  CheckCircle2,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../context/authcontext";

const columns = [
  {
    title: "To Do",
    color: "text-gray-600",
    bg: "bg-gray-100",
    icon: Circle,
  },
  {
    title: "In Progress",
    color: "text-blue-600",
    bg: "bg-blue-100",
    icon: Clock,
  },
  {
    title: "Completed",
    color: "text-green-600",
    bg: "bg-green-100",
    icon: CheckCircle2,
  },
];

function Kanban() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTasks = async () => {
    try {
      setError("");

      const response = await api.get("/tasks");

      const data = response.data;

      setTasks(
        Array.isArray(data)
          ? data
          : data.tasks || []
      );
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setError(
        err.response?.data?.message || "Failed to load tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const getTaskOwnerId = (task) => {
    const owner =
      task.owner || task.createdBy || task.user || task.assignedTo;

    if (typeof owner === "string") {
      return owner;
    }

    return owner?._id || owner?.id || "";
  };

  const getTaskOwnerName = (task) => {
    const owner =
      task.owner || task.createdBy || task.user || task.assignedTo;

    if (typeof owner === "object" && owner !== null) {
      return owner.name || owner.email || "Unknown user";
    }

    return "Task owner";
  };

  const canUpdateTask = (task) => {
    if (!user) return false;

    if (user.role === "admin") return true;

    const ownerId = getTaskOwnerId(task);

    return ownerId && ownerId === (user._id || user.id);
  };

  const updateTaskStatus = async (task, newStatus) => {
    if (!canUpdateTask(task)) {
      return;
    }

    try {
      await api.put(`/tasks/${task._id}`, {
        status: newStatus,
      });

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item._id === task._id
            ? { ...item, status: newStatus }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update task:", err);

      alert(
        err.response?.data?.message ||
          "Unable to update task status. Check your backend."
      );
    }
  };

  const getProjectName = (task) => {
    if (typeof task.project === "object" && task.project !== null) {
      return task.project.name || task.project.title || "Project";
    }

    return "Project";
  };

  const getPriorityStyle = (priority) => {
    switch ((priority || "Medium").toLowerCase()) {
      case "high":
        return "bg-red-50 text-red-600";

      case "low":
        return "bg-green-50 text-green-600";

      default:
        return "bg-amber-50 text-amber-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <RefreshCw className="animate-spin text-violet-600" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-violet-600">
            Workspace / Kanban
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Kanban Board
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Track tasks and monitor progress across your workspace.
          </p>
        </div>

        <button
          onClick={fetchTasks}
          className="flex items-center justify-center gap-2 self-start rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {columns.map((column) => {
          const count = tasks.filter(
            (task) => task.status === column.title
          ).length;

          const Icon = column.icon;

          return (
            <div
              key={column.title}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {column.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {count}
                  </h2>
                </div>

                <div className={`rounded-xl p-3 ${column.bg} ${column.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;

          const columnTasks = tasks.filter(
            (task) => task.status === column.title
          );

          return (
            <div
              key={column.title}
              className="min-w-0 rounded-2xl border border-gray-200 bg-gray-50/80 p-4"
            >
              {/* Column header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`rounded-lg p-2 ${column.bg} ${column.color}`}>
                    <Icon size={17} />
                  </div>

                  <h2 className="font-semibold text-gray-800">
                    {column.title}
                  </h2>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200">
                  {columnTasks.length}
                </span>
              </div>

              {/* Task cards */}
              <div className="space-y-3">
                {columnTasks.map((task) => {
                  const editable = canUpdateTask(task);

                  return (
                    <div
                      key={task._id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <h3 className="font-semibold leading-5 text-gray-900">
                          {task.title}
                        </h3>

                        <span
                          className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ${getPriorityStyle(
                            task.priority
                          )}`}
                        >
                          {task.priority || "Medium"}
                        </span>
                      </div>

                      <p className="mb-4 line-clamp-3 text-sm leading-6 text-gray-500">
                        {task.description || "No description provided."}
                      </p>

                      {/* Project */}
                      <div className="mb-3 rounded-lg bg-gray-50 px-3 py-2">
                        <p className="text-xs text-gray-400">
                          Project
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-gray-700">
                          {getProjectName(task)}
                        </p>
                      </div>

                      {/* Owner */}
                      <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                          {getTaskOwnerName(task)
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-700">
                            {getTaskOwnerName(task)}
                          </p>

                          <p className="text-xs text-gray-400">
                            Task owner
                          </p>
                        </div>
                      </div>

                      {/* Due date */}
                      {task.dueDate && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                          <CalendarDays size={14} />

                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}

                      {/* Status update */}
                      {editable ? (
                        <div className="mt-4">
                          <label className="mb-1.5 block text-xs font-medium text-gray-500">
                            Update status
                          </label>

                          <select
                            value={task.status || "To Do"}
                            onChange={(event) =>
                              updateTaskStatus(task, event.target.value)
                            }
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                          >
                            {columns.map((item) => (
                              <option
                                key={item.title}
                                value={item.title}
                              >
                                {item.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-center text-xs text-gray-500">
                          View only
                        </p>
                      )}
                    </div>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-white px-4 py-10 text-center">
                    <Icon
                      size={25}
                      className="mx-auto text-gray-300"
                    />

                    <p className="mt-3 text-sm font-medium text-gray-500">
                      No tasks here
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      Tasks will appear in this column.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Kanban;