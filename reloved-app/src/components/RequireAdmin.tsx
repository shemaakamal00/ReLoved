import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function RequireAdmin ({ children} : { children: ReactNode}) {
    const { user } = useAuth();

    if (!user || user.role !== "admin") {
        return <Navigate to="/login" replace />;
    }

    return <> {children}</>;
}

export default RequireAdmin;