import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Kanban,
  Sparkles,
  LogOut,
  Zap,
} from "lucide-react";

import { useAuth } from "../context/authcontext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", path: "/projects", icon: FolderKanban },
    { name: "Kanban Board", path: "/kanban", icon: Kanban },
    { name: "AI Assistant", path: "/ai", icon: Sparkles },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Zap size={23} />
        </div>

        <div>
          <h2>TaskForge <span>AI</span></h2>
          <p>PROJECT WORKSPACE</p>
        </div>
      </div>

      <p className="sidebar-label">WORKSPACE</p>

      <nav className="sidebar-nav">
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="user-profile">
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div className="user-details">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.email || "Workspace member"}</span>
          </div>
        </div>

        <button className="logout-link" onClick={handleLogout}>
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}