import { signOut } from "firebase/auth";
import { Link, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { useUser } from "../contexts/UserContext";
import { Logo } from "../components/Logo";
import { Home, FileText, HelpCircle, Clock } from "lucide-react";
import styles from "./AppLayout.module.css";

export default function Header() {
  const { user, isAdmin } = useUser();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={styles.header}>
      <div className={styles.logoContainer}>
        <Logo />
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


      <div className={styles.userSection}>
        {user ? (
          <>
            <span className={styles.userName} style={{ marginLeft: "1rem" }}>
              שלום {user.displayName || user.email}
            </span>

            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="תמונת משתמש"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  marginLeft: "1rem"
                }}
              />
            )}

            {isAdmin && (
              <Link
                to="/admin"
                style={{
                  marginLeft: "1rem",
                  padding: "0.5rem 1rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                }}
              >
                ניהול מערכת
              </Link>
            )}

            <button onClick={() => signOut(auth)} style={{ marginLeft: "1rem" }}>
              🚪 התנתק
            </button>
          </>
        ) : (
          <Link to="/login" className={styles.navLink}>
            התחבר
          </Link>
        )}
      </div>
    </div >
  );
}
