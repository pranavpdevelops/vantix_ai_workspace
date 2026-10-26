
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/authcontext";

import ProtectedRoute from "./components/protectedRoutes";
import SideBar from "./components/SideBar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dshboard";
import Projects from "./pages/Project";
import Tasks from "./pages/Task";
import Kanban from "./pages/Kanban";
import Ai from "./pages/Ai";
import Admin from "./pages/Admin";


function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar />

      <main className="min-h-screen min-w-0 p-4 pt-20 sm:p-6 sm:pt-20 min-[761px]:ml-[255px] min-[761px]:p-8">
        <Outlet />
      </main>
    </div>
  );
}


function AdminRoute() {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Admin />;
}
function AppRoutes() {
  const { user, loading } = useAuth();

  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-violet-200 border-t-violet-600" />

          <p className="text-sm font-medium text-gray-500">
            Loading Vantix AI...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
    
      <Route
        path="/"
        element={
          <Navigate
            to={user ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/register"
        element={
          user ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<Projects />} />

          <Route path="/tasks" element={<Tasks />} />

          <Route path="/kanban" element={<Kanban />} />

          <Route path="/ai" element={<Ai />} />

          <Route path="/admin" element={<AdminRoute />} />
        </Route>
      </Route>
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}