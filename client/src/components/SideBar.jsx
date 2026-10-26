import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Columns3,
  Bot,
  LogOut,
  Sparkles,
  Menu,
  X,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "../context/authcontext";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Tasks", path: "/tasks", icon: ListTodo },
  { label: "Kanban Board", path: "/kanban", icon: Columns3 },
  { label: "AI Assistant", path: "/ai", icon: Bot },
];

function SideBar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const closeMenu = () => {
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
     const confirmed = window.confirm(
      "Are you sure you want to LogOut?"
    );

    if (!confirmed) return;
    closeMenu();

    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3 md:hidden">
        <Link
          to="/dashboard"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
            <Sparkles size={20} />
          </span>

          <span className="text-lg font-bold text-[#17172B]">
            VANTIX <span className="text-violet-600">AI</span>
          </span>
        </Link>

        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          className="rounded-xl border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50"
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMenu}
          aria-label="Close navigation overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col border-r border-gray-100 bg-white p-5 shadow-xl transition-transform duration-300 md:sticky md:top-0 md:z-20 md:h-screen md:w-64 md:max-w-none md:translate-x-0 md:shadow-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={closeMenu}
            className="flex items-center gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Sparkles size={21} />
            </span>

            <span className="text-xl font-bold text-[#17172B]">
              Vantix<span className="text-violet-600">AI</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={closeMenu}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Heading */}
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Workspace
        </p>

        {/* Navigation Links */}
        <nav
          className="flex flex-1 flex-col gap-2 overflow-y-auto"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              location.pathname === item.path ||
              (item.path !== "/dashboard" &&
                location.pathname.startsWith(`${item.path}/`));

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon size={19} />

                <span>{item.label}</span>

                {active && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-violet-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* AI Assistant Card */}
        <div className="mt-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 p-4 text-white">
          <Sparkles size={22} />

          <h3 className="mt-3 font-semibold">
            Meet your AI assistant
          </h3>

          <p className="mt-1 text-xs leading-5 text-white/80">
            Get help planning and organizing your work.
          </p>

          <Link
            to="/ai"
            onClick={closeMenu}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:text-violet-100"
          >
            Try AI Assistant
            <ArrowUpRight size={16} />
          </Link>
        </div>

        {/* User Profile */}
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
            {(user?.name || user?.email || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-800">
              {user?.name || "User"}
            </p>

            <p className="truncate text-xs text-gray-500">
              {user?.email || "Workspace member"}
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <LogOut size={19} />
          Logout
        </button>
      </aside>
    </>
  );
}

export default SideBar;