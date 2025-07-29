import React, { createContext, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, HelpCircle, Clock } from "lucide-react";
import { ToastContainer } from "./Toast";
import { useToast } from "../helpers/useToast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import styles from "./AppLayout.module.css";

// ✅ ייבוא כותרת חכמה עם שם משתמש ותמונה דינמית
import Header from "./Header";

// Create Toast Context
const ToastContext = createContext<ReturnType<typeof useToast> | null>(null);

export const useAppToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useAppToast must be used within a ToastProvider');
  }
  return context;
};

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  const location = useLocation();
  const toast = useToast();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <ToastContext.Provider value={toast}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logoContainer}>
            <Link to="/" className={styles.logo}>
              <div className={styles.logoIcon}>A</div>
              <span className={styles.logoText}>בונה הערכות</span>
            </Link>
          </div>

          <nav className={styles.nav}>
            <Link to="/" className={`${styles.navLink} ${isActive("/") ? styles.active : ""}`}>
              <Home size={18} />
              <span>בית</span>
            </Link>
            <Link to="/my-assessments" className={`${styles.navLink} ${isActive("/my-assessments") ? styles.active : ""}`}>
              <FileText size={18} />
              <span>ההערכות שלי</span>
            </Link>
            <Link to="/help" className={`${styles.navLink} ${isActive("/help") ? styles.active : ""}`}>
              <HelpCircle size={18} />
              <span>עזרה</span>
            </Link>
            <Link to="/teaching-library" className={`${styles.navLink} ${isActive("/teaching-library") ? styles.active : ""}`}>
              <span>📚 ספריית הוראה</span>
            </Link>
            <Link to="/pending-submissions" className={`${styles.navLink} ${isActive("/pending-submissions") ? styles.active : ""}`}>
              <Clock size={18} />
              <span>הגשות ממתינות</span>
            </Link>
          </nav>

          {/* 🔁 כאן שילבנו את Header במקום רבקה */}
          <div className={styles.userSection}>
            <Header />
          </div>
        </header>

        <main className={`${styles.main} ${className || ""}`}>
          {children}
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p>&copy; {new Date().getFullYear()} בונה הערכות. כל הזכויות שמורות.</p>
          </div>
        </footer>

        {/* Toast Container */}
        <ToastContainer
          toasts={toast.toasts}
          onRemoveToast={toast.removeToast}
        />
      </div>
    </ToastContext.Provider>
  );
};
