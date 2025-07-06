"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, HelpCircle, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./Avatar";
// import { Button } from "./Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import styles from "./AppLayout.module.css";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
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
        </nav>
        
        <div className={styles.userSection}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className={styles.userProfile}>
                <Avatar>
                  <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" alt="User" />
                  <AvatarFallback>DR</AvatarFallback>
                </Avatar>
                <span className={styles.userName}>Dr. Rebecca Chen</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>פרופיל</DropdownMenuItem>
              <DropdownMenuItem>הגדרות</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut size={16} className={styles.menuIcon} />
                <span>התנתק</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
    </div>
  );
};