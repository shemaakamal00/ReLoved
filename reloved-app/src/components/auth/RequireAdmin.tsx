import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageMessage from "../ui/PageMessage";

function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <PageMessage>Laddar...</PageMessage>;

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <> {children}</>;
}

export default RequireAdmin;
