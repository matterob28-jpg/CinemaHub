import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// A logged-out user goes to login, a logged-in non-admin goes back home
export default function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
}
