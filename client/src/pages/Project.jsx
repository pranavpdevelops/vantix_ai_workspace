import { useEffect, useState } from "react";
import { Search, Pencil, Trash2, X } from "lucide-react";
import api from "../api";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Planning",
  });

  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/projects");

      // Supports APIs that return either an array or { projects: [...] }
      const projectData = Array.isArray(res.data)
        ? res.data
        : res.data.projects || [];

      setProjects(projectData);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
      setError(
        err.response?.data?.message || "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Update form fields
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Create or update a project
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (editId) {
        await api.put(`/projects/${editId}`, form);
      } else {
        await api.post("/projects", form);
      }

      setForm({
        name: "",
        description: "",
        status: "Planning",
      });

      setEditId(null);

      await fetchProjects();
    } catch (err) {
      console.error("Failed to save project:", err);
      setError(
        err.response?.data?.message || "Failed to save project."
      );
    }
  };

  // Load project into the form for editing
  const handleEdit = (project) => {
    setForm({
      name: project.name || "",
      description: project.description || "",
      status: project.status || "Planning",
    });

    setEditId(project._id);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete a project
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/projects/${id}`);

      if (editId === id) {
        handleCancel();
      }

      await fetchProjects();
    } catch (err) {
      console.error("Failed to delete project:", err);
      setError(
        err.response?.data?.message || "Failed to delete project."
      );
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setForm({
      name: "",
      description: "",
      status: "Planning",
    });

    setEditId(null);
    setError("");
  };

  // Filter projects by name, description, or status
  const searchText = search.toLowerCase().trim();

  const filteredProjects = projects.filter((project) => {
    return (
      project.name?.toLowerCase().includes(searchText) ||
      project.description?.toLowerCase().includes(searchText) ||
      project.status?.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-[#F7F8FC] px-4 py-8 text-[#17172B] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold text-[#6D5DFB]">
              WORKSPACE
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Projects
            </h1>

            <p className="mt-2 text-sm text-[#77788D]">
              Create, manage, and track your projects.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E9EAF2] bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-[#77788D]">Total Projects</p>
            <p className="mt-1 text-2xl font-bold text-[#6D5DFB]">
              {projects.length}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="shrink-0"
              aria-label="Dismiss error"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Create / Edit Project Form */}
        <section className="mt-8 rounded-2xl border border-[#E9EAF2] bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              {editId ? "Edit Project" : "Create New Project"}
            </h2>

            <p className="mt-1 text-sm text-[#77788D]">
              {editId
                ? "Update your project details."
                : "Add a new project to your workspace."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold"
              >
                Project Name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter project name"
                required
                className="w-full rounded-xl border border-[#E9EAF2] bg-[#FCFCFE] px-4 py-3 text-sm outline-none transition placeholder:text-[#A0A1B3] focus:border-[#6D5DFB] focus:ring-4 focus:ring-[#6D5DFB]/10"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold"
              >
                Description
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your project"
                rows="3"
                className="w-full resize-y rounded-xl border border-[#E9EAF2] bg-[#FCFCFE] px-4 py-3 text-sm outline-none transition placeholder:text-[#A0A1B3] focus:border-[#6D5DFB] focus:ring-4 focus:ring-[#6D5DFB]/10"
              />
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-semibold"
              >
                Status
              </label>

              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#E9EAF2] bg-[#FCFCFE] px-4 py-3 text-sm outline-none transition focus:border-[#6D5DFB] focus:ring-4 focus:ring-[#6D5DFB]/10"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-xl bg-[#6D5DFB] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5948E8]"
              >
                {editId ? "Update Project" : "Create Project"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-xl border border-[#E9EAF2] px-6 py-3 text-sm font-semibold text-[#77788D] transition hover:bg-[#F7F8FC]"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Projects Section */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">All Projects</h2>

              <p className="mt-1 text-sm text-[#77788D]">
                {search.trim()
                  ? `${filteredProjects.length} matching projects`
                  : `${filteredProjects.length} projects`}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-5">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9999AA]"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by project name, description, or status..."
              aria-label="Search projects"
              className="w-full rounded-xl border border-[#E9EAF2] bg-white py-4 pl-12 pr-12 text-sm outline-none transition placeholder:text-[#A0A1B3] focus:border-[#6D5DFB] focus:ring-4 focus:ring-[#6D5DFB]/10"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9999AA] transition hover:text-[#6D5DFB]"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-12 text-center text-sm text-[#77788D]">
              Loading projects...
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredProjects.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-[#DCDDEC] bg-white px-5 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EEFF] text-[#6D5DFB]">
                <Search size={25} />
              </div>

              <h3 className="mt-4 text-lg font-bold">
                {search.trim()
                  ? "No projects found"
                  : "No projects yet"}
              </h3>

              <p className="mt-2 text-sm text-[#77788D]">
                {search.trim()
                  ? "Try a different project name, description, or status."
                  : "Create your first project using the form above."}
              </p>

              {search.trim() && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="mt-4 rounded-lg bg-[#F0EEFF] px-4 py-2 text-sm font-semibold text-[#6D5DFB] transition hover:bg-[#E5E0FF]"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Projects Grid */}
          {!loading && filteredProjects.length > 0 && (
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="rounded-2xl border border-[#E9EAF2] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-lg font-bold">
                        {project.name}
                      </h3>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#77788D]">
                        {project.description || "No description provided."}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        project.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : project.status === "In Progress"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#F0F0F6] pt-4">
                    <p className="text-xs text-[#9999AA]">
                      Project
                    </p>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(project)}
                        aria-label={`Edit ${project.name}`}
                        className="flex items-center gap-2 rounded-lg bg-[#F0EEFF] px-3 py-2 text-sm font-semibold text-[#6D5DFB] transition hover:bg-[#E5E0FF]"
                      >
                        <Pencil size={15} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(project._id)}
                        aria-label={`Delete ${project.name}`}
                        className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
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

export default Projects;