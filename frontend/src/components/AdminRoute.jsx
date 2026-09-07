import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { loading, isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (loading) return <main className="admin-route-loading"><span className="eyebrow">DeepTravel</span><h1>Restoring your session.</h1></main>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;
  return <Outlet />;
}
