import { useState } from "react";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleEmailSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("🎉 נרשמת בהצלחה!");
    } catch (error: any) {
      alert("שגיאה בהרשמה: " + error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      alert("✅ התחברת עם Gmail!");
    } catch (error: any) {
      alert("שגיאה בגוגל: " + error.message);
    }
  };

  return (
    <div style={{ direction: "rtl", padding: "2rem", textAlign: "right" }}>
      <h2>הרשמה למערכת</h2>
      <input type="email" placeholder="אימייל" onChange={(e) => setEmail(e.target.value)} />
      <br />
      <input type="password" placeholder="סיסמה" onChange={(e) => setPassword(e.target.value)} />
      <br /><br />
      <button onClick={handleEmailSignup}>📩 הרשמה עם מייל</button>
      <br /><br />
      <button onClick={handleGoogleSignup}>🔐 התחברות עם Gmail</button>
    </div>
  );
}
