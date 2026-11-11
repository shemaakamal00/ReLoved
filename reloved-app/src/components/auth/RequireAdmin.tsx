import { type ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";
import PageMessage from "../ui/PageMessage";
import AdminLogin from "./AdminLogin";

// Admin kan se panelen. customers ser inloggningen
function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <PageMessage>Laddar...</PageMessage>;
  if (user?.role !== "admin") return <AdminLogin />;

  return <>{children}</>;
}

export default RequireAdmin;
