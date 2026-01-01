import { signOut } from "firebase/auth";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, HelpCircle, Clock } from "lucide-react";
import { auth } from "../firebase";
import { useAuth } from "../features/auth/AuthProvider";
import { Logo } from "./Logo";
import layoutStyles from "./AppLayout.module.css";
import styles from "./Header.module.css";

export default function Header() {
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className={layoutStyles.header}>
      <div className={layoutStyles.logoContainer}>
        <Logo />
      </div>

      <nav className={layoutStyles.nav}>
        <Link to="/" className={`${layoutStyles.navLink} ${isActive("/") ? layoutStyles.active : ""}`}>
          <Home size={18} />
          <span>בית</span>
        </Link>
        <Link to="/my-assessments" className={`${layoutStyles.navLink} ${isActive("/my-assessments") ? layoutStyles.active : ""}`}>
          <FileText size={18} />
          <span>ההערכות שלי</span>
        </Link>
        <Link to="/help" className={`${layoutStyles.navLink} ${isActive("/help") ? layoutStyles.active : ""}`}>
          <HelpCircle size={18} />
          <span>עזרה</span>
        </Link>
        <Link to="/teaching-library" className={`${layoutStyles.navLink} ${isActive("/teaching-library") ? layoutStyles.active : ""}`}>
          <span>📚 ספריית הוראה</span>
        </Link>
        <Link to="/pending-submissions" className={`${layoutStyles.navLink} ${isActive("/pending-submissions") ? layoutStyles.active : ""}`}>
          <Clock size={18} />
          <span>הגשות ממתינות</span>
        </Link>
        {isAdmin && (
          <Link to="/admin" className={styles.adminLink}>
            ניהול מערכת
          </Link>
        )}
      </nav>

      <div className={layoutStyles.userSection}>
        {user ? (
          <>
            <span className={layoutStyles.userName} style={{ marginLeft: "1rem" }}>
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

            <button onClick={() => signOut(auth)} style={{ marginLeft: "1rem" }}>
              🚪 התנתק
            </button>
          </>
        ) : (
          <Link to="/login" className={layoutStyles.navLink}>
            התחבר
          </Link>
        )}
      </div>
    </div>
  );
}
