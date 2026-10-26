
import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Columns3,
  Bot,
  ShieldCheck,
  LogOut,
  Menu,
  X,Users
} from "lucide-react";

import { useAuth } from "../context/authcontext";

const links = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
  { name: "Kanban", path: "/kanban", icon: Columns3 },
  { name: "AI Assistant", path: "/ai", icon: Bot },
  { name: "Community", path: "/community", icon: Users },
];

export default function SideBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    const confirmed = window.confirm(
      "LogOut"
    );
    if (!confirmed) return;
    setMenuOpen(false);
    logout();
    navigate("/login");
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-violet-600 text-white shadow-lg shadow-violet-200"
        : "text-gray-600 hover:bg-violet-50 hover:text-violet-700"
    }`;

  return (
    <>
     
      <button
        type="button"
        onClick={() => setMenuOpen((previous) => !previous)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        className="fixed left-4 top-4 z-[110] flex h-11 w-11 items-center justify-center rounded-xl border border-violet-100 bg-white text-violet-700 shadow-md transition hover:bg-violet-50 min-[761px]:hidden"
      >
        {menuOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

     
      {menuOpen && (
        <button
          type="button"
          onClick={() => setMenuOpen(false)}
          aria-label="Close sidebar"
          className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] min-[761px]:hidden"
        />
      )}

     
      <aside
        className={`fixed left-0 top-0 z-[100] flex h-dvh w-[255px] max-w-[85vw] flex-col overflow-y-auto border-r border-violet-100 bg-white p-5 shadow-xl transition-transform duration-300 ease-in-out min-[761px]:translate-x-0 min-[761px]:shadow-none ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight text-violet-700">
            Vantix <span className="text-gray-800">AI</span>
          </h1>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-gray-500 transition hover:bg-violet-50 hover:text-violet-700 min-[761px]:hidden"
          >
            <X size={20} />
          </button>
        </div>

      
        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
          Workspace
        </p>

        
        <nav className="flex-1 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                className={linkClass}
              >
                <Icon size={19} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}

          
          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass}>
              <ShieldCheck size={19} />
              <span>Admin</span>
            </NavLink>
          )}
        </nav>

        {/* User profile */}
        <div className="mt-6 border-t border-gray-100 pt-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 font-bold text-violet-700">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {user?.name.toUpperCase() || "User"}
              </p>

              <p className="text-xs capitalize text-gray-500">
                {user?.email || "Member"}
              </p>
            </div>
          </div>

          
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition hover:bg-red-50"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}