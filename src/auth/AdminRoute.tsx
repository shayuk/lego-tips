import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * AdminRoute component - requires admin role
 * Redirects to /auth if not logged in
 * Shows access denied message if logged in but not admin
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, isLoading } = useUser();

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "50vh",
        direction: "rtl"
      }}>
        <div>טוען...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "50vh",
        direction: "rtl",
        padding: "2rem",
        textAlign: "center"
      }}>
        <h2>גישה נדחתה</h2>
        <p>דף זה זמין למנהלים בלבד.</p>
        <p style={{ marginTop: "1rem", color: "#666" }}>
          Access denied. Admins only.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

