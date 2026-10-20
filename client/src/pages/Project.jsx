
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
        setEditId(null);
        setForm({
          name: "",
          description: "",
          status: "Planning",
        });
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
    <main className="min-h-screen bg-[#080A12] px-4 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-violet-400">
          My Projects
        </h1>

        <p className="mt-2 text-slate-400">
          Manage all your projects in one place.
        </p>

        {error && (
          <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-red-300">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-[#111827] p-6"
        >
          <h2 className="text-xl font-semibold">
            {editId ? "Edit Project" : "Create Project"}
          </h2>

          <input
            className="w-full rounded-lg border border-white/10 bg-[#080A12] p-3 outline-none focus:border-violet-500"
            name="name"
            placeholder="Project name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <textarea
            className="w-full rounded-lg border border-white/10 bg-[#080A12] p-3 outline-none focus:border-violet-500"
            name="description"
            placeholder="Project description"
            value={form.description}
            onChange={handleChange}
            rows="3"
          />

          <select
            className="w-full rounded-lg border border-white/10 bg-[#080A12] p-3"
            name="status"
            value={form.status}
            onChange={handleChange}
          >
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-lg bg-violet-600 px-5 py-3 font-medium hover:bg-violet-500"
              type="submit"
            >
              {editId ? "Update Project" : "Create Project"}
            </button>

            {editId && (
              <button
                className="rounded-lg border border-white/20 px-5 py-3"
                type="button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">
            Your Projects ({projects.length})
          </h2>

          {loading && (
            <p className="mt-4 text-slate-400">
              Loading projects...
            </p>
          )}

          {!loading && projects.length === 0 && (
            <p className="mt-4 text-slate-400">
              No projects yet. Create your first project above.
            </p>
          )}

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {projects.map((project) => (
              <article
                key={project._id}
                className="rounded-2xl border border-white/10 bg-[#111827] p-5 transition hover:border-violet-500/50"
              >
                <h3 className="text-xl font-semibold">
                  {project.name}
                </h3>

                <p className="mt-2 whitespace-pre-wrap text-slate-400">
                  {project.description || "No description"}
                </p>

                <span className="mt-4 inline-block rounded-full bg-teal-500/10 px-3 py-1 text-sm text-teal-300">
                  {project.status}
                </span>

                <div className="mt-5 flex gap-3">
                  <button
                    className="rounded-lg bg-violet-600 px-4 py-2"
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </button>

                  <button
                    className="rounded-lg bg-red-500/10 px-4 py-2 text-red-300"
                    onClick={() => handleDelete(project._id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Projects;
