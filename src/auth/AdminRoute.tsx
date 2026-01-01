import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider";

interface AdminRouteProps {
  children: ReactNode;
}

/**
 * AdminRoute component - requires admin role
 * Redirects to /login if not logged in
 * Shows access denied message if logged in but not admin
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
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
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
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

