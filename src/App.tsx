import { Routes, Route } from "react-router-dom";

import HomePageLayout from "./pages/_index.pageLayout";
import AssessmentBuilderPageLayout from "./pages/assessment-builder.pageLayout";
import MyAssessmentsPageLayout from "./pages/my-assessments.pageLayout";
import TeachingLibraryPageLayout from "./pages/teaching-library.pageLayout";
import HelpPageLayout from "./pages/help.pageLayout";
import PendingSubmissionsPageLayout from "./pages/pending-submissions.pageLayout";
import { AdminPage } from "./pages/AdminPage";

// 🆕 דף התחברות/הרשמה מותאם אישית
import { LoginPage } from "./features/auth/LoginPage";

// 🧠 כותרת עליונה עם שם משתמש + התנתקות
import Header from "./components/Header";

// 🔒 Route protection components
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { AdminRoute } from "./auth/AdminRoute";

function App() {
  return (
    <>
      <Header /> {/* ✅ מוצג תמיד אם המשתמש מחובר */}
      <Routes>
        {/* 🔐 דף התחברות/הרשמה - Public route */}
        <Route path="/login" element={<LoginPage />} />

        {/* 🏠 דפים עיקריים - Protected routes (require login) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePageLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assessment-builder"
          element={
            <ProtectedRoute>
              <AssessmentBuilderPageLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-assessments"
          element={
            <ProtectedRoute>
              <MyAssessmentsPageLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teaching-library"
          element={
            <ProtectedRoute>
              <TeachingLibraryPageLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <HelpPageLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pending-submissions"
          element={
            <ProtectedRoute>
              <PendingSubmissionsPageLayout />
            </ProtectedRoute>
          }
        />

        {/* 👑 Admin routes - Require admin role */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
