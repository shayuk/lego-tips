import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/_index'
import AssessmentBuilderPage from '../pages/assessment-builder'
import MyAssessmentsPage from '../pages/my-assessments'

console.log('🏠 App.tsx loaded');

function App() {
  console.log('🔄 App component rendering...');
  console.log('📍 Current URL:', window.location.pathname);
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/assessment-builder" element={<AssessmentBuilderPage />} />
      <Route path="/my-assessments" element={<MyAssessmentsPage />} />
    </Routes>
  )
}

export default App 