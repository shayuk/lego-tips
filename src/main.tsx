import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './global.css';

// 🆕 ייבוא של UserProvider
import { UserProvider } from './contexts/UserContext';

console.log('🚀 Main.tsx loaded');

// Check if root element exists
const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);

if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

console.log('🎯 Creating React root...');

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('✅ React root created successfully');

  console.log('🔄 Rendering App...');
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <UserProvider> {/* ⬅️ כאן אנחנו שומרים את המשתמש המחובר */}
          <App />
        </UserProvider>
      </BrowserRouter>
    </React.StrictMode>
  );

  console.log('🎉 App rendered successfully');
} catch (error) {
  console.error('💥 Error during React rendering:', error);

  // Fallback: render a simple error message
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1 style="color: red;">שגיאה בטעינת האפליקציה</h1>
      <p>אנא פתח את Developer Tools (F12) ובדוק את הקונסול לפרטים נוספים.</p>
      <p>Error: ${errorMessage}</p>
    </div>
  `;
}
