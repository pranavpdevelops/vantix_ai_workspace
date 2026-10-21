
import { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

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
      setError(
        err.response?.data?.message || "Failed to save project"
      );
    }
  };

  const handleEdit = (project) => {
    setForm({
      name: project.name,
      description: project.description || "",
      status: project.status || "Planning",
    });

    setEditId(project._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    try {
      setError("");
      await api.delete(`/projects/${id}`);

      setProjects((prev) =>
        prev.filter((project) => project._id !== id)
      );

      if (editId === id) {
        handleCancel();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete project"
      );
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({
      name: "",
      description: "",
      status: "Planning",
    });
  };

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-10 text-[#17172B] sm:px-8">
      <div className="mx-auto max-w-5xl">

        
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#6D5DFB]">
              Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              My Projects
            </h1>

            <p className="mt-2 text-[#77788D]">
              Organize your work and bring your ideas to life.
            </p>
          </div>

          <div className="flex h-16 items-center gap-3 rounded-2xl border border-[#E9EAF2] bg-white px-5 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F0EEFF] text-lg text-[#6D5DFB]">
              {projects.length}
            </div>

            <div>
              <p className="text-sm text-[#77788D]">Total projects</p>
              <p className="font-semibold">Your workspace</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </p>
        )}

       
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-[#E9EAF2] bg-white p-5 shadow-sm sm:p-7"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F0EEFF] text-xl text-[#6D5DFB]">
              {editId ? "✎" : "+"}
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {editId ? "Edit Project" : "Create a Project"}
              </h2>

              <p className="mt-1 text-sm text-[#77788D]">
                {editId
                  ? "Update your project details below."
                  : "Add a new project to your workspace."}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#38384F]">
                Project Name
              </label>

              <input
                className="w-full rounded-xl border border-[#E3E4EF] bg-[#FCFCFE] px-4 py-3 text-[#17172B] outline-none transition placeholder:text-[#A0A1B3] focus:border-[#6D5DFB] focus:bg-white focus:ring-4 focus:ring-[#6D5DFB]/10"
                name="name"
                placeholder="e.g. Task Management App"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-[#38384F]">
                Description
              </label>

              <textarea
                className="w-full resize-y rounded-xl border border-[#E3E4EF] bg-[#FCFCFE] px-4 py-3 text-[#17172B] outline-none transition placeholder:text-[#A0A1B3] focus:border-[#6D5DFB] focus:bg-white focus:ring-4 focus:ring-[#6D5DFB]/10"
                name="description"
                placeholder="What is this project about?"
                value={form.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#38384F]">
                Project Status
              </label>

              <select
                className="w-full rounded-xl border border-[#E3E4EF] bg-[#FCFCFE] px-4 py-3 text-[#38384F] outline-none transition focus:border-[#6D5DFB] focus:ring-4 focus:ring-[#6D5DFB]/10"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#F0F0F6] pt-5">
            <button
              className="rounded-xl bg-[#6D5DFB] px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-[#5948E8] hover:shadow-md active:scale-[0.98]"
              type="submit"
            >
              {editId ? "Update Project" : "+ Create Project"}
            </button>

            {editId && (
              <button
                className="rounded-xl border border-[#E3E4EF] bg-white px-6 py-3 font-semibold text-[#55556B] transition hover:bg-[#F7F8FC]"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Project List */}
        <section className="mt-10">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Your Projects
              </h2>

              <p className="mt-1 text-sm text-[#77788D]">
                View and manage all your projects.
              </p>
            </div>

            <span className="w-fit rounded-full bg-[#F0EEFF] px-4 py-2 text-sm font-semibold text-[#6D5DFB]">
              {projects.length} projects
            </span>
          </div>

          {loading && (
            <div className="mt-6 rounded-2xl border border-[#E9EAF2] bg-white p-8 text-center text-[#77788D]">
              Loading your projects...
            </div>
          )}

          {!loading && projects.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-[#DADBE9] bg-white px-6 py-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F0EEFF] text-2xl text-[#6D5DFB]">
                +
              </div>

              <h3 className="mt-4 text-lg font-bold">
                No projects yet
              </h3>

              <p className="mt-2 text-sm text-[#77788D]">
                Create your first project using the form above.
              </p>
            </div>
          )}

          {!loading && projects.length > 0 && (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project._id}
                  className="group rounded-2xl border border-[#E9EAF2] bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-[#D4CEFF] hover:shadow-lg hover:shadow-[#6D5DFB]/5 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F0EEFF] text-xl font-bold text-[#6D5DFB]">
                        {project.name?.charAt(0).toUpperCase() || "P"}
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-bold text-[#22223A]">
                          {project.name}
                        </h3>

                        <p className="mt-1 text-xs text-[#9999AA]">
                          Project workspace
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        project.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : project.status === "In Progress"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {project.status}
                    </span>
                  </div>

                  <p className="mt-5 min-h-12 whitespace-pre-wrap break-words text-sm leading-6 text-[#77788D]">
                    {project.description || "No description provided."}
                  </p>

                  <div className="mt-5 flex gap-3 border-t border-[#F0F0F6] pt-4">
                    <button
                      className="rounded-lg bg-[#F0EEFF] px-4 py-2 text-sm font-semibold text-[#6D5DFB] transition hover:bg-[#E5E0FF]"
                      onClick={() => handleEdit(project)}
                    >
                      Edit
                    </button>

                    <button
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                      onClick={() => handleDelete(project._id)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Projects;