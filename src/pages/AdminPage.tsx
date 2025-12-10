/**
 * Admin Analytics Dashboard
 * Shows key metrics and error logs for administrators
 */

import { useAdminAnalytics } from "../analytics/useAdminAnalytics";
import { RefreshCw, Users, FileText, Lightbulb, Zap, AlertCircle } from "lucide-react";
import { Button } from "../components/Button";


export function AdminPage() {
  const { analytics, isLoading, error, refresh } = useAdminAnalytics();

  if (isLoading) {
    return (
      <div style={{ direction: "rtl", padding: "2rem", textAlign: "center" }}>
        <p>טוען נתונים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ direction: "rtl", padding: "2rem" }}>
        <h1>לוח בקרה למנהלים</h1>
        <p style={{ color: "#dc2626" }}>שגיאה בטעינת נתונים: {error.message}</p>
        <Button onClick={refresh} style={{ marginTop: "1rem" }}>
          נסה שוב
        </Button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div style={{ direction: "rtl", padding: "2rem" }}>
        <h1>לוח בקרה למנהלים</h1>
        <p>אין נתונים זמינים</p>
      </div>
    );
  }

  const formatTimestamp = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("he-IL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ direction: "rtl", padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>

          <h1 style={{ margin: 0 }}>לוח בקרה למנהלים</h1>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw size={16} style={{ marginLeft: "0.5rem" }} />
          רענן
        </Button>
      </div>

      {/* Stat Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "1.5rem",
        marginBottom: "3rem"
      }}>
        {/* Active Users Card */}
        <div style={{
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <Users size={24} style={{ marginLeft: "0.5rem", color: "#3b82f6" }} />
            <h3 style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>משתמשים פעילים השבוע</h3>
          </div>
          <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#111827" }}>
            {analytics.activeUsersThisWeek}
          </p>
        </div>

        {/* AI Generations Card */}
        <div style={{
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <Zap size={24} style={{ marginLeft: "0.5rem", color: "#f59e0b" }} />
            <h3 style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>יצירות AI השבוע</h3>
          </div>
          <p style={{ margin: 0, fontSize: "2rem", fontWeight: "bold", color: "#111827" }}>
            {analytics.aiGenerationsThisWeek}
          </p>
        </div>

        {/* Top Pages Card */}
        <div style={{
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <FileText size={24} style={{ marginLeft: "0.5rem", color: "#10b981" }} />
            <h3 style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>דפים פופולריים</h3>
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            {analytics.topPages.length > 0 ? (
              analytics.topPages.slice(0, 3).map((page, index) => (
                <div key={index} style={{ marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                  <span style={{ color: "#111827" }}>{page.path}</span>
                  <span style={{ color: "#6b7280", marginRight: "0.5rem" }}> ({page.count})</span>
                </div>
              ))
            ) : (
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>אין נתונים</p>
            )}
          </div>
        </div>

        {/* Top Tips Card */}
        <div style={{
          backgroundColor: "#fff",
          padding: "1.5rem",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
            <Lightbulb size={24} style={{ marginLeft: "0.5rem", color: "#8b5cf6" }} />
            <h3 style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>טיפים פופולריים</h3>
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            {analytics.topTips.length > 0 ? (
              analytics.topTips.slice(0, 3).map((tip, index) => (
                <div key={index} style={{ marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                  <span style={{ color: "#111827" }}>{tip.title}</span>
                  <span style={{ color: "#6b7280", marginRight: "0.5rem" }}> ({tip.count})</span>
                </div>
              ))
            ) : (
              <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>אין נתונים</p>
            )}
          </div>
        </div>
      </div>

      {/* Error Log Section */}
      <div style={{
        backgroundColor: "#fff",
        padding: "1.5rem",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        border: "1px solid #e5e7eb"
      }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
          <AlertCircle size={20} style={{ marginLeft: "0.5rem", color: "#dc2626" }} />
          <h2 style={{ margin: 0 }}>לוג שגיאות</h2>
        </div>

        {analytics.recentErrors.length > 0 ? (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {analytics.recentErrors.map((error, index) => (
              <div
                key={index}
                style={{
                  padding: "0.75rem",
                  marginBottom: "0.5rem",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "4px",
                  fontSize: "0.875rem"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                  <span style={{ color: "#991b1b", fontWeight: "500" }}>{error.message}</span>
                  <span style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                    {formatTimestamp(error.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#6b7280", margin: 0 }}>אין שגיאות אחרונות</p>
        )}
      </div>
    </div>
  );
}
