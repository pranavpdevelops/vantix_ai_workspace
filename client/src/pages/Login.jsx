import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FolderKanban, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../context/authcontext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 px-4">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl md:grid-cols-2">
        
        <div className="hidden flex-col justify-between bg-gradient-to-br from-violet-700 to-indigo-600 p-10 text-white md:flex">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-3">
              <FolderKanban size={28} />
            </div>

            <h1 className="text-2xl font-bold">Vantix AI</h1>
          </div>

          <div>
            <h2 className="mb-4 text-4xl font-bold leading-tight">
              Manage projects.
              <br />
              Build something great.
            </h2>

            <p className="max-w-sm text-violet-100">
              Organize projects, manage tasks, track progress, and
              collaborate with your team in one workspace.
            </p>
          </div>

          <p className="text-sm text-violet-200">
            Your workspace, all in one place.
          </p>
        </div>

        <div className="p-6 sm:p-10 md:p-12">
          <div className="mb-8">
            <div className="mb-5 inline-flex rounded-xl bg-violet-100 p-3 text-violet-700 md:hidden">
              <FolderKanban size={28} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back
            </h2>

            <p className="mt-2 text-gray-500">
              Sign in to continue to your workspace.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-violet-600 hover:text-violet-700"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}