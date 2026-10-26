
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import api from "../api";
import { useAuth } from "../context/authcontext";

const initialForm = {
  name: "",
  description: "",
  status: "Planning",
  startDate: "",
  dueDate: "",
};

export default function Projects() {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === "admin";

  const getOwner = (project) => {
    const owner =
      project.owner ||
      project.createdBy ||
      project.user;

    if (typeof owner === "string") {
      return {
        id: owner,
        name: project.ownerName || "Unknown",
      };
    }

    return {
      id: owner?._id || owner?.id || "",
      name: owner?.name || project.ownerName || "Unknown",
    };
  };

  const canManage = (project) => {
    if (isAdmin) return true;

    const owner = getOwner(project);

    return Boolean(
      user &&
      owner.id &&
      (owner.id === user._id || owner.id === user.id)
    );
  };

  const fetchProjects = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/projects");

      const data = response.data;

      setProjects(
        Array.isArray(data)
          ? data
          : data.projects || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const openCreateForm = () => {
    setEditingProject(null);
    setFormData(initialForm);
    setError("");
    setShowForm(true);
  };

  const openEditForm = (project) => {
    setEditingProject(project);

    setFormData({
      name: project.name || project.title || "",
      description: project.description || "",
      status: project.status || "Planning",
      startDate: project.startDate
        ? project.startDate.slice(0, 10)
        : "",
      dueDate: project.dueDate
        ? project.dueDate.slice(0, 10)
        : "",
    });

    setError("");
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      if (editingProject) {
        await api.put(
          `/projects/${editingProject._id}`,
          formData
        );
      } else {
        await api.post("/projects", formData);
      }

      setShowForm(false);
      setEditingProject(null);
      setFormData(initialForm);

      await fetchProjects();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to save the project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name || project.title}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await api.delete(`/projects/${project._id}`);

      setProjects((current) =>
        current.filter((item) => item._id !== project._id)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete the project."
      );
    }
  };

  const filteredProjects = projects.filter((project) => {
    const query = search.toLowerCase();

    const matchesSearch =
      (project.name || project.title || "")
        .toLowerCase()
        .includes(query) ||
      (project.description || "")
        .toLowerCase()
        .includes(query) ||
      getOwner(project).name.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" ||
      project.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusStyles = {
    Planning: "bg-blue-50 text-blue-700",
    "In Progress": "bg-violet-50 text-violet-700",
    Active: "bg-green-50 text-green-700",
    Completed: "bg-emerald-50 text-emerald-700",
    OnHold: "bg-orange-50 text-orange-700",
    "On Hold": "bg-orange-50 text-orange-700",
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-violet-600">
            WORKSPACE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Projects
          </h1>

          <p className="mt-2 text-gray-500">
            Explore and manage projects across your workspace.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
        >
          <Plus size={19} />
          New Project
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Search and filter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search projects or owners..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-violet-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-violet-500 sm:w-48"
        >
          <option value="All">All statuses</option>
          <option value="Planning">Planning</option>
          <option value="In Progress">In Progress</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>

        <button
          onClick={fetchProjects}
          title="Refresh projects"
          className="flex items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-gray-600 hover:bg-gray-50"
        >
          <RefreshCw size={19} />
        </button>
      </div>

      {/* Project count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-800">
            {filteredProjects.length}
          </span>{" "}
          of {projects.length} projects
        </p>

        {isAdmin && (
          <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
            Admin access
          </span>
        )}
      </div>

      {/* Project cards */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw
            size={30}
            className="animate-spin text-violet-600"
          />
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <FolderKanban size={30} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            No projects found
          </h2>

          <p className="mt-2 text-gray-500">
            Try another search or create a new project.
          </p>

          <button
            onClick={openCreateForm}
            className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-700"
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {filteredProjects.map((project) => {
            const owner = getOwner(project);
            const manageable = canManage(project);

            return (
              <article
                key={project._id}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
                      <FolderKanban size={23} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-gray-900">
                        {project.name || project.title}
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        Project workspace
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[project.status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {project.status || "Planning"}
                  </span>
                </div>

                <p className="mt-5 min-h-12 text-sm leading-6 text-gray-500">
                  {project.description ||
                    "No description has been added."}
                </p>

                {/* Owner */}
                <div className="mt-5 flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
                    {owner.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-gray-400">
                      Project owner
                    </p>

                    <p className="truncate text-sm font-semibold text-gray-800">
                      {owner.name}
                      {manageable && (
                        <span className="ml-2 text-xs font-normal text-violet-600">
                          {isAdmin && owner.id !== user?._id
                            ? "Manage"
                            : "You can manage"}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    Start:{" "}
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "Not set"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    Due:{" "}
                    {project.dueDate
                      ? new Date(project.dueDate).toLocaleDateString()
                      : "Not set"}
                  </span>
                </div>

                {/* Owner/admin actions */}
                {manageable && (
                  <div className="mt-5 flex gap-3 border-t border-gray-100 pt-4">
                    <button
                      onClick={() => openEditForm(project)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-200 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(project)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-gray-900/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProject
                    ? "Edit Project"
                    : "Create Project"}
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Enter the project details below.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Project name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  required
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
                  placeholder="Describe your project..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Start date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
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
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingProject
                      ? "Update Project"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
