import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("✅ התחברת בהצלחה!");
    } catch (error: any) {
      alert("שגיאה בהתחברות: " + error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      alert("🔓 התחברות עם Google הצליחה!");
    } catch (error: any) {
      alert("שגיאה בגוגל: " + error.message);
    }
  };

  return (
    <div style={{ direction: "rtl", padding: "2rem", textAlign: "right" }}>
      <h2>התחברות למערכת</h2>
      <input type="email" placeholder="אימייל" onChange={(e) => setEmail(e.target.value)} />
      <br />
      <input type="password" placeholder="סיסמה" onChange={(e) => setPassword(e.target.value)} />
      <br /><br />
      <button onClick={handleEmailLogin}>🔐 התחברות עם מייל</button>
      <br /><br />
      <button onClick={handleGoogleLogin}>🧠 התחברות עם Gmail</button>
    </div>
  );
}
