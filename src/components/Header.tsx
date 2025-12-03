import { signOut } from "firebase/auth";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { useUser } from "../contexts/UserContext";

export default function Header() {
  const { user, isAdmin } = useUser();

  if (!user) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      direction: "rtl",
      padding: "1rem",
      backgroundColor: "#f7f7f7",
      borderBottom: "1px solid #ccc",
      position: "relative"
    }}>
      {isAdmin && (
        <span style={{
          position: "absolute",
          top: "0.5rem",
          right: "1rem",
          fontSize: "0.75rem",
          color: "#666",
          direction: "rtl"
        }}>
          שלום שי (אדמין)
        </span>
      )}

      <span style={{ marginLeft: "1rem", fontWeight: "bold" }}>
        שלום {user.displayName || user.email} 👋
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
    </div>
  );
}
