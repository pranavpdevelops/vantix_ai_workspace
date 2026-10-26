
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  User,
  Mail,
  LockKeyhole,
} from "lucide-react";

import api from "../api";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      setSuccess("Account created successfully!");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-indigo-50 px-4 py-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl md:grid-cols-2">
        {/* Left section */}
        <div className="hidden flex-col justify-between bg-gradient-to-br from-violet-700 to-indigo-600 p-10 text-white md:flex">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/15 p-3">
              <FolderKanban size={28} />
            </div>

            <h1 className="text-2xl font-bold">
              Vantix AI
            </h1>
          </div>

          <div>
            <h2 className="mb-4 text-4xl font-bold leading-tight">
              Bring your projects
              <br />
              together.
            </h2>

            <p className="max-w-sm text-violet-100">
              Create your account to organize projects, manage
              tasks, and track your team's progress.
            </p>
          </div>

          <p className="text-sm text-violet-200">
            One workspace. Better teamwork.
          </p>
        </div>

        {/* Registration form */}
        <div className="p-6 sm:p-10 md:p-12">
          <div className="mb-7">
            <div className="mb-5 inline-flex rounded-xl bg-violet-100 p-3 text-violet-700 md:hidden">
              <FolderKanban size={28} />
            </div>

            <h2 className="text-3xl font-bold text-gray-900">
              Create account
            </h2>

            <p className="mt-2 text-gray-500">
              Join Vantix AI and manage your projects.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>
            </div>

            {/* Email */}
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
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>
            </div>

            {/* Password */}
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
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-violet-600 hover:text-violet-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
