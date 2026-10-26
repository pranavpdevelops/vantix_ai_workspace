import { useEffect, useState } from "react";
import { Users, FolderKanban, CheckSquare, Mail } from "lucide-react";
import api from "../api";

export default function Community() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/community");

      setUsers(Array.isArray(data.users) ? data.users : []);
      setProjects(Array.isArray(data.projects) ? data.projects : []);
      setTasks(Array.isArray(data.tasks) ? data.tasks : []);
    } catch (err) {
      console.error(
        "Community API error:",
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          "Unable to load community data."
      );
    } finally {
      setLoading(false);
    }
  };

  const getOwnerId = (item) => {
    const owner = item.owner || item.createdBy || item.user;

    if (typeof owner === "string") {
      return owner;
    }

    return owner?._id || owner?.id || "";
  };

  const getUserProjects = (user) =>
    projects.filter((project) => getOwnerId(project) === user._id);

  const getUserTasks = (user) =>
    tasks.filter((task) => getOwnerId(task) === user._id);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading community...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
     
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Community
        </h1>

        <p className="mt-2 text-gray-500">
          Explore community members and their projects and tasks.
        </p>
      </div>

      
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}


      <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
              <Users size={23} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {users.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
              <FolderKanban size={23} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Projects</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {projects.length}
              </h2>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <CheckSquare size={23} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Tasks</p>
              <h2 className="text-2xl font-bold text-gray-900">
                {tasks.length}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* User Cards */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-gray-900">
          Community Members
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {users.length} registered members
        </p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
          No users found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {users.map((user) => {
            const userProjects = getUserProjects(user);
            const userTasks = getUserTasks(user);

            return (
              <div
                key={user._id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
               
                <div className="border-b border-gray-100 p-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-xl font-bold text-violet-700">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-bold text-gray-900">
                        {user.name || "Unnamed User"}
                      </h3>

                      <p className="mt-1 flex items-center gap-2 break-all text-sm text-gray-500">
                        <Mail size={15} className="shrink-0" />
                        {user.email || "No email available"}
                      </p>

                      <span className="mt-2 inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-medium capitalize text-violet-700">
                        {user.role || "user"}
                      </span>
                    </div>
                  </div>
                </div>

               
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 font-semibold text-gray-800">
                      <FolderKanban size={18} className="text-blue-600" />
                      Projects
                    </h4>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
                      {userProjects.length}
                    </span>
                  </div>

                  {userProjects.length === 0 ? (
                    <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-400">
                      No projects yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {userProjects.map((project) => (
                        <div
                          key={project._id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
                        >
                          <p className="min-w-0 truncate text-sm font-medium text-gray-800">
                            {project.name || project.title || "Untitled Project"}
                          </p>

                          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs capitalize text-gray-600">
                            {project.status || "Planning"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

               
                <div className="border-t border-gray-100 p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="flex items-center gap-2 font-semibold text-gray-800">
                      <CheckSquare size={18} className="text-emerald-600" />
                      Tasks
                    </h4>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                      {userTasks.length}
                    </span>
                  </div>

                  {userTasks.length === 0 ? (
                    <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-400">
                      No tasks yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {userTasks.map((task) => (
                        <div
                          key={task._id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                              {task.title || task.name || "Untitled Task"}
                            </p>

                            <p className="mt-1 text-xs capitalize text-gray-400">
                              Priority: {task.priority || "Normal"}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-xs capitalize text-emerald-700">
                            {task.status || "To Do"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}