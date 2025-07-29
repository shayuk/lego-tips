import { Routes, Route } from "react-router-dom";
import HomePageLayout from "./pages/_index.pageLayout";
import AssessmentBuilderPageLayout from "./pages/assessment-builder.pageLayout";
import MyAssessmentsPageLayout from "./pages/my-assessments.pageLayout";
import TeachingLibraryPageLayout from "./pages/teaching-library.pageLayout"; 
import HelpPageLayout from "./pages/help.pageLayout";
import PendingSubmissionsPageLayout from "./pages/pending-submissions.pageLayout";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePageLayout />} />
      <Route
        path="/assessment-builder"
        element={<AssessmentBuilderPageLayout />}
      />
      <Route
        path="/my-assessments"
        element={<MyAssessmentsPageLayout />}
      />
      <Route path="/teaching-library" element={<TeachingLibraryPageLayout />} />
      <Route path="/help" element={<HelpPageLayout />} />
      <Route path="/pending-submissions" element={<PendingSubmissionsPageLayout />} />
    </Routes>
  );
}

export default App;
