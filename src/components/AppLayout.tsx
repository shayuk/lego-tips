import React, { createContext, useContext } from "react";
import { ToastContainer } from "./Toast";
import { useToast } from "../helpers/useToast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import { Logo } from "./Logo";
import styles from "./AppLayout.module.css";
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
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <div className={styles.container}>
        <Header />

        <main className={`${styles.main} ${className || ""}`}>
          {children}
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerContent}>
            <p>&copy; {new Date().getFullYear()} Lego-Tips. כל הזכויות שמורות.</p>
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
