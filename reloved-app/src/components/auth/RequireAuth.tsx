import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import PageMessage from "../ui/PageMessage";

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Väntar tills vi säkerställer att kunden är inloggad
  if (loading) return <PageMessage>Laddar...</PageMessage>;

  if (!user) {
    // Kommer igå sidan så man kommer tillbaka
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <> {children} </>;
}

export default RequireAuth;
