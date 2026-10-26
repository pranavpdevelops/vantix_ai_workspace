import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const columns = [
  {
    title: "To Do",
    color: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  {
    title: "In Progress",
    color: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  {
    title: "Completed",
    color: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
];

function Kanban() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [movingId, setMovingId] = useState(null);

  const navigate = useNavigate();

  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/tasks");
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
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

  const moveTask = async (task, newStatus) => {
    if (task.status === newStatus || movingId) return;

    const oldStatus = task.status;

    try {
      setError("");
      setMovingId(task._id);

    
      setTasks((prev) =>
        prev.map((item) =>
          item._id === task._id
            ? { ...item, status: newStatus }
            : item
        )
      );

      await api.put(`/tasks/${task._id}`, {
        title: task.title,
        description: task.description || "",
        status: newStatus,
        priority: task.priority || "Medium",
        dueDate: task.dueDate || null,
      });
    } catch (err) {
      // Restore the previous status if the request fails
      setTasks((prev) =>
        prev.map((item) =>
          item._id === task._id
            ? { ...item, status: oldStatus }
            : item
        )
      );

      setError(
        err.response?.data?.message || "Failed to update task status."
      );
    } finally {
      setMovingId(null);
    }
  };

 
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData("taskId", task._id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, status) => {
    e.preventDefault();

    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((item) => item._id === taskId);

    if (task) {
      moveTask(task, status);
    }
  };

  const getPriorityStyle = (priority) => {
    if (priority === "High") {
      return "bg-red-50 text-red-600";
    }

    if (priority === "Low") {
      return "bg-slate-100 text-slate-600";
    }

    return "bg-violet-50 text-violet-700";
  };

  return (
    <main className="min-h-screen bg-[#F7F8FC] px-4 py-8 text-[#17172B] sm:px-8">
      <div className="mx-auto max-w-7xl">

        
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-[#6D5DFB]">
              Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Kanban Board
            </h1>

            <p className="mt-2 text-sm text-[#77788D]">
              Drag and drop tasks to update their progress.
            </p>
          </div>

          <button
            onClick={() => navigate("/tasks")}
            className="w-fit rounded-xl bg-[#6D5DFB] px-5 py-3 font-semibold text-white transition hover:bg-[#5948E8]"
          >
            + Manage Tasks
          </button>
        </div>

      
        {error && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <span>{error}</span>

            <button
              onClick={fetchTasks}
              className="font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {columns.map((column) => {
            const count = tasks.filter(
              (task) => task.status === column.title
            ).length;

            return (
              <div
                key={column.title}
                className="rounded-2xl border border-[#E9EAF2] bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#77788D]">
                    {column.title}
                  </span>

                  <span
                    className={`rounded-lg px-3 py-1 text-sm font-bold ${column.color}`}
                  >
                    {count}
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold">
                  {count}{" "}
                  <span className="text-sm font-normal text-[#77788D]">
                    {count === 1 ? "task" : "tasks"}
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        
        {loading ? (
          <div className="mt-8 rounded-2xl border border-[#E9EAF2] bg-white p-10 text-center text-[#77788D]">
            Loading your board...
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-5 lg:grid-cols-3">
            {columns.map((column) => {
              const columnTasks = tasks.filter(
                (task) => task.status === column.title
              );

              return (
                <section
                  key={column.title}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => handleDrop(e, column.title)}
                  className="min-h-96 rounded-2xl border border-[#E9EAF2] bg-[#F0F1F7] p-3 sm:p-4"
                >
                  {/* Column Header */}
                  <div className="mb-4 flex items-center justify-between px-1 py-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${column.dot}`}
                      />

                      <h2 className="font-bold">{column.title}</h2>
                    </div>

                    <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-white px-2 text-sm font-semibold text-[#77788D]">
                      {columnTasks.length}
                    </span>
                  </div>

                  
                  {columnTasks.length === 0 && (
                    <div className="rounded-xl border border-dashed border-[#D4D5E2] bg-white/60 px-4 py-10 text-center">
                      <p className="text-sm text-[#9999AA]">
                        No tasks here
                      </p>

                      <p className="mt-1 text-xs text-[#AAAA BA]">
                        Drag a task into this column
                      </p>
                    </div>
                  )}

                  {/* Task Cards */}
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <article
                        key={task._id}
                        draggable={movingId !== task._id}
                        onDragStart={(e) => handleDragStart(e, task)}
                        className={`rounded-xl border border-[#E9EAF2] bg-white p-4 shadow-sm transition hover:border-[#D4CEFF] hover:shadow-md ${
                          movingId === task._id
                            ? "cursor-wait opacity-50"
                            : "cursor-grab active:cursor-grabbing"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="break-words font-bold text-[#22223A]">
                            {task.title}
                          </h3>

                          <span className="shrink-0 text-xs text-[#AAAAAA]">
                            ⠿
                          </span>
                        </div>

                        <p className="mt-2 line-clamp-3 whitespace-pre-wrap break-words text-sm leading-5 text-[#77788D]">
                          {task.description || "No description provided."}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityStyle(
                              task.priority
                            )}`}
                          >
                            {task.priority || "Medium"} Priority
                          </span>
                        </div>

                        <div className="mt-4 border-t border-[#F0F0F6] pt-3">
                          <p className="truncate text-xs text-[#77788D]">
                            Project:{" "}
                            <span className="font-semibold text-[#55556B]">
                              {task.project?.name || "Project"}
                            </span>
                          </p>

                          {task.dueDate && (
                            <p className="mt-2 text-xs text-[#77788D]">
                              Due:{" "}
                              {new Date(
                                task.dueDate
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        
                        <div className="mt-4">
                          <label className="mb-1 block text-xs font-medium text-[#77788D]">
                            Move to
                          </label>

                          <select
                            value={task.status}
                            disabled={movingId === task._id}
                            onChange={(e) =>
                              moveTask(task, e.target.value)
                            }
                            className="w-full rounded-lg border border-[#E3E4EF] bg-[#FCFCFE] px-3 py-2 text-sm outline-none focus:border-[#6D5DFB] disabled:opacity-50"
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
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {!loading && tasks.length === 0 && !error && (
          <div className="mt-6 rounded-2xl border border-dashed border-[#DADBE9] bg-white p-8 text-center">
            <h3 className="text-lg font-bold">No tasks available</h3>

            <p className="mt-2 text-sm text-[#77788D]">
              Create a task first to see it on your Kanban board.
            </p>

            <button
              onClick={() => navigate("/tasks")}
              className="mt-5 rounded-xl bg-[#6D5DFB] px-5 py-3 font-semibold text-white hover:bg-[#5948E8]"
            >
              Create Your First Task
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Kanban;