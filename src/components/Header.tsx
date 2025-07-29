import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useUser } from "../contexts/UserContext";

export default function Header() {
  const user = useUser();

  if (!user) return null;

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      direction: "rtl",
      padding: "1rem",
      backgroundColor: "#f7f7f7",
      borderBottom: "1px solid #ccc"
    }}>
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

      <button onClick={() => signOut(auth)} style={{ marginLeft: "1rem" }}>
        🚪 התנתק
      </button>
    </div>
  );
}
