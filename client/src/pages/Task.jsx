
import { useEffect, useState } from "react";
import api from "../api";

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  const initialForm = {
    title: "",
    description: "",
    projectId: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
  };

  const [form, setForm] = useState(initialForm);

  // Fetch projects for the dropdown
  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load projects"
      );
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Create or update task
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const taskData = {
        title: form.title,
        description: form.description,
        projectId: form.projectId,
        status: form.status,
        priority: form.priority,
        dueDate: form.dueDate || null,
      };

      if (editId) {
        await api.put(`/tasks/${editId}`, taskData);
      } else {
        await api.post("/tasks", taskData);
      }

      setForm(initialForm);
      setEditId(null);
      await fetchTasks();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save task"
      );
    }
  };

  // Edit task
  const handleEdit = (task) => {
    setForm({
      title: task.title || "",
      description: task.description || "",
      projectId: task.project?._id || task.project || "",
      status: task.status || "To Do",
      priority: task.priority || "Medium",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });

    setEditId(task._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete task
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setError("");
      await api.delete(`/tasks/${id}`);

      setTasks((prev) =>
        prev.filter((task) => task._id !== id)
      );

      if (editId === id) {
        handleCancel();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete task"
      );
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(initialForm);
  };

  const statusStyle = (status) => {
    if (status === "Completed") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "In Progress") {
      return "bg-blue-50 text-blue-700";
    }

    return "bg-amber-50 text-amber-700";
  };

  const priorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-red-50 text-red-600";
    }

    if (priority === "Low") {
      return "bg-slate-100 text-slate-600";
    }

    return "bg-violet-50 text-violet-700";
  };

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-10 text-[#17172B] sm:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-[#6D5DFB]">
            Workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            My Tasks
          </h1>

          <p className="mt-2 text-[#77788D]">
            Plan your work, track progress, and meet your deadlines.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Task Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-[#E9EAF2] bg-white p-5 shadow-sm sm:p-7"
        >
          <div>
            <h2 className="text-xl font-bold">
              {editId ? "Update Task" : "Create New Task"}
            </h2>

            <p className="mt-1 text-sm text-[#77788D]">
              Add task details and assign them to a project.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Task Title
              </label>

              <input
                className="w-full rounded-xl border border-[#E3E4EF] bg-[#FCFCFE] px-4 py-3 outline-none focus:border-[#6D5DFB] focus:ring-4 focus:ring-[#6D5DFB]/10"
                name="title"
                placeholder="e.g. Build login page"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                className="w-full rounded-xl border border-[#E3E4EF] bg-[#FCFCFE] px-4 py-3 outline-none focus:border-[#6D5DFB] focus:ring-4 focus:ring-[#6D5DFB]/10"
                name="description"
                placeholder="Describe what needs to be done..."
                value={form.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Project
              </label>

              <select
                className="w-full rounded-xl border border-[#E3E4EF] bg-white px-4 py-3 outline-none focus:border-[#6D5DFB]"
                name="projectId"
                value={form.projectId}
                onChange={handleChange}
                required
              >
                <option value="">Select a project</option>

                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>

              {projects.length === 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  Create a project before adding tasks.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Due Date
              </label>

              <input
                className="w-full rounded-xl border border-[#E3E4EF] bg-white px-4 py-3 outline-none focus:border-[#6D5DFB]"
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Status
              </label>

              <select
                className="w-full rounded-xl border border-[#E3E4EF] bg-white px-4 py-3 outline-none focus:border-[#6D5DFB]"
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Priority
              </label>

              <select
                className="w-full rounded-xl border border-[#E3E4EF] bg-white px-4 py-3 outline-none focus:border-[#6D5DFB]"
                name="priority"
                value={form.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-[#F0F0F6] pt-5">
            <button
              type="submit"
              disabled={projects.length === 0}
              className="rounded-xl bg-[#6D5DFB] px-6 py-3 font-semibold text-white transition hover:bg-[#5948E8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {editId ? "Update Task" : "+ Create Task"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-xl border border-[#E3E4EF] px-6 py-3 font-semibold text-[#55556B] hover:bg-[#F7F8FC]"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Tasks List */}
        <section className="mt-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">All Tasks</h2>
              <p className="mt-1 text-sm text-[#77788D]">
                {tasks.length} tasks in your workspace
              </p>
            </div>
          </div>

          {loading && (
            <p className="mt-5 rounded-xl bg-white p-6 text-center text-[#77788D]">
              Loading tasks...
            </p>
          )}

          {!loading && tasks.length === 0 && (
            <div className="mt-5 rounded-2xl border border-dashed border-[#DADBE9] bg-white px-6 py-12 text-center">
              <h3 className="text-lg font-bold">No tasks yet</h3>
              <p className="mt-2 text-sm text-[#77788D]">
                Create your first task using the form above.
              </p>
            </div>
          )}

          {!loading && tasks.length > 0 && (
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {tasks.map((task) => (
                <article
                  key={task._id}
                  className="rounded-2xl border border-[#E9EAF2] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#D4CEFF] hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="break-words text-lg font-bold">
                      {task.title}
                    </h3>

                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-[#77788D]">
                    {task.description || "No description provided."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${priorityStyle(
                        task.priority
                      )}`}
                    >
                      {task.priority} Priority
                    </span>

                    <span className="rounded-full bg-[#F0EEFF] px-3 py-1 text-xs font-semibold text-[#6D5DFB]">
                      {task.project?.name || "Project"}
                    </span>
                  </div>

                  {task.dueDate && (
                    <p className="mt-4 text-sm text-[#77788D]">
                      Due:{" "}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-5 flex gap-3 border-t border-[#F0F0F6] pt-4">
                    <button
                      type="button"
                      onClick={() => handleEdit(task)}
                      className="rounded-lg bg-[#F0EEFF] px-4 py-2 text-sm font-semibold text-[#6D5DFB] hover:bg-[#E5E0FF]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(task._id)}
                      className="rounded-lg bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
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

export default Tasks;
