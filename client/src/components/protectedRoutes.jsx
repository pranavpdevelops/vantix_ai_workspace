import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authcontext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="loading">Loading workspace...</p>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}