import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";

export default function AuthPage() {
  const uiRef = useRef<firebaseui.auth.AuthUI | null>(null);
  const navigate = useNavigate(); // ⬅️ מאפשר לנו לבצע redirect

  useEffect(() => {
    if (!uiRef.current) {
      uiRef.current = new firebaseui.auth.AuthUI(auth);
    }כ

    uiRef.current.start("#firebaseui-auth-container", {
      signInOptions: [
        EmailAuthProvider.PROVIDER_ID,
        GoogleAuthProvider.PROVIDER_ID,
      ],
      signInFlow: "popup",
      callbacks: {
        signInSuccessWithAuthResult: () => {
          alert("🎉 התחברת בהצלחה!");
          navigate("/"); // ⬅️ מעבר אוטומטי לעמוד הבית
          return false; // לא לבצע redirect ברירת מחדל
        },
      },
    });
  }, [navigate]);

  return (
    <div style={{ direction: "rtl", padding: "2rem", textAlign: "center" }}>
      <h2>התחברות / הרשמה</h2>
      <div id="firebaseui-auth-container" />
    </div>
  );
}
