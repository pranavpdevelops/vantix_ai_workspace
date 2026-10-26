
import { useEffect, useState } from "react";
import {
  CheckSquare,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  RefreshCw,
  Flag,
} from "lucide-react";

import api from "../api";
import { useAuth } from "../context/authcontext";

const initialForm = {
  title: "",
  description: "",
  project: "",
  status: "To Do",
  priority: "Medium",
  dueDate: "",
};

const statusStyles = {
  "To Do": "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
};

const priorityStyles = {
  Low: "bg-green-50 text-green-700",
  Medium: "bg-orange-50 text-orange-700",
  High: "bg-red-50 text-red-700",
};

export default function Tasks() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(initialForm);

  const isAdmin = user?.role === "admin";


  const getOwner = (task) => {
    const owner = task.owner || task.createdBy || task.user;

    if (typeof owner === "string") {
      return {
        id: owner,
        name: task.ownerName || "Unknown",
      };
    }

    return {
      id: owner?._id || owner?.id || "",
      name: owner?.name || task.ownerName || "Unknown",
    };
  };

  
  const canManage = (task) => {
    if (isAdmin) return true;

    const owner = getOwner(task);
    const currentUserId = user?._id || user?.id;

    return Boolean(
      currentUserId &&
        owner.id &&
        String(owner.id) === String(currentUserId)
    );
  };

  
  const getProjectId = (task) => {
    if (task.project && typeof task.project === "object") {
      return task.project._id || "";
    }

    return task.project || task.projectId || "";
  };


  const getProjectName = (task) => {
    if (task.project && typeof task.project === "object") {
      return (
        task.project.name ||
        task.project.title ||
        "Unknown project"
      );
    }

    const projectId = getProjectId(task);

    const matchingProject = projects.find(
      (project) => String(project._id) === String(projectId)
    );

    return (
      matchingProject?.name ||
      matchingProject?.title ||
      task.projectName ||
      "Unknown project"
    );
  };

  
  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [taskResponse, projectResponse] = await Promise.all([
        api.get("/tasks"),
        api.get("/projects"),
      ]);

      const taskData = taskResponse.data;
      const projectData = projectResponse.data;

      setTasks(
        Array.isArray(taskData)
          ? taskData
          : Array.isArray(taskData?.tasks)
            ? taskData.tasks
            : []
      );

      setProjects(
        Array.isArray(projectData)
          ? projectData
          : Array.isArray(projectData?.projects)
            ? projectData.projects
            : []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load tasks and projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const openCreateForm = () => {
    setEditingTask(null);
    setFormData(initialForm);
    setError("");
    setShowForm(true);
  };

  
  const openEditForm = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title || task.name || "",
      description: task.description || "",
      project: getProjectId(task),
      status: task.status || "To Do",
      priority: task.priority || "Medium",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : "",
    });

    setError("");
    setShowForm(true);
  };

  
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    if (!formData.project) {
      setError("Please select a project.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description,
        projectId: formData.project,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
      };

      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await api.post("/tasks", payload);
      }

      setShowForm(false);
      setEditingTask(null);
      setFormData(initialForm);

      await fetchData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the task."
      );
    } finally {
      setSaving(false);
    }
  };

  
  const handleDelete = async (task) => {
    const confirmed = window.confirm(
      `Delete task "${task.title || task.name}"?`
    );

    if (!confirmed) return;

    setError("");
    setDeletingId(task._id);

    try {
      await api.delete(`/tasks/${task._id}`);

      setTasks((current) =>
        current.filter((item) => item._id !== task._id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the task."
      );
    } finally {
      setDeletingId(null);
    }
  };

  
  const filteredTasks = tasks.filter((task) => {
    const query = search.toLowerCase();

    const title = task.title || task.name || "";
    const description = task.description || "";
    const ownerName = getOwner(task).name;
    const projectName = getProjectName(task);

    const matchesSearch = [
      title,
      description,
      ownerName,
      projectName,
    ].some((value) =>
      String(value).toLowerCase().includes(query)
    );

    const matchesStatus =
      statusFilter === "All" || task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" ||
      task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            WORKSPACE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Tasks
          </h1>

          <p className="mt-2 text-gray-500">
            Manage tasks and track progress across projects.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus size={19} />
          New Task
        </button>
      </div>

      
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>

          <button
            onClick={() => setError("")}
            aria-label="Close error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 outline-none focus:border-violet-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-3 outline-none focus:border-violet-500"
        >
          <option value="All">All statuses</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value)
          }
          className="rounded-xl border border-gray-200 bg-white px-3 py-3 outline-none focus:border-violet-500"
        >
          <option value="All">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-900">
            {filteredTasks.length}
          </span>{" "}
          of {tasks.length} tasks
        </p>

        {isAdmin && (
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            Admin access
          </span>
        )}
      </div>

    
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <RefreshCw
              size={28}
              className="animate-spin text-violet-600"
            />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <CheckSquare
              size={38}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              No tasks found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Try changing the filters or create a new task.
            </p>

            <button
              onClick={openCreateForm}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
            >
              Create Task
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr className="text-xs uppercase tracking-wide text-gray-500">
                  <th className="px-6 py-4 font-semibold">Task</th>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Due date</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredTasks.map((task) => {
                  const owner = getOwner(task);
                  const manageable = canManage(task);

                  return (
                    <tr
                      key={task._id}
                      className="transition hover:bg-violet-50/30"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 rounded-lg bg-violet-100 p-2 text-violet-700">
                            <CheckSquare size={17} />
                          </div>

                          <div className="max-w-xs">
                            <p className="font-semibold text-gray-900">
                              {task.title || task.name}
                            </p>

                            <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                              {task.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-600">
                        {getProjectName(task)}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                            {owner.name.charAt(0).toUpperCase()}
                          </div>

                          <span className="text-sm text-gray-700">
                            {owner.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                            statusStyles[task.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {task.status || "To Do"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                            priorityStyles[task.priority] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <Flag size={12} />
                          {task.priority || "Medium"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span className="flex items-center gap-2 whitespace-nowrap text-sm text-gray-600">
                          <CalendarDays
                            size={15}
                            className="text-gray-400"
                          />
                          {formatDate(task.dueDate)}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {manageable ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditForm(task)}
                              title="Edit task"
                              className="rounded-lg p-2 text-violet-600 hover:bg-violet-100"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              onClick={() => handleDelete(task)}
                              disabled={deletingId === task._id}
                              title="Delete task"
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                            >
                              {deletingId === task._id ? (
                                <RefreshCw
                                  size={17}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={17} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            View only
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTask ? "Edit Task" : "Create Task"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Add the task details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Task title
                </label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the task..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Project
                </label>

                <select
                  name="project"
                  value={formData.project}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
                >
                  <option value="">Select a project</option>

                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name || project.title || "Untitled project"}
                    </option>
                  ))}
                </select>

                {projects.length === 0 && (
                  <p className="mt-2 text-xs text-orange-600">
                    Create a project before adding a task.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Due date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || projects.length === 0}
                  className="flex-1 rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingTask
                      ? "Update Task"
                      : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}