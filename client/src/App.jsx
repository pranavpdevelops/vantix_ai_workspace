
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { useAuth } from "./context/authcontext";
import ProtectedRoute from "./components/protectedRoutes";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dshboard";
import Projects from "./pages/Project";
import Tasks from "./pages/Task";
import Kanban from "./pages/Kanban";
import AI from "./pages/Ai";

function PlaceholderPage({ title }) {
  return (
    <div className="dashboard-main">
      <p className="breadcrumb">Workspace</p>
      <h1>{title}</h1>
      <p className="muted">
        This feature will be implemented in the next step.
      </p>
    </div>
  );
}

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="loading">Loading...</p>;
  }

  return (
    <Navigate
      to={user ? "/dashboard" : "/login"}
      replace
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/projects"
            element={<Projects />}
          />
          <Route path="/tasks" element={<Tasks />} />

          <Route
            path="/kanban"
            element={< Kanban/>}
          />

          <Route
            path="/ai"
            element={< AI/>}
          />
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
