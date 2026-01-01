import { useState, FormEvent, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError,
} from "firebase/auth";
import { auth } from "../../firebase";
import { useAuth } from "./AuthProvider";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import styles from "./LoginPage.module.css";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const returnTo = searchParams.get("returnTo") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(returnTo, { replace: true });
    }
  }, [user, navigate, returnTo]);

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      // Navigation will happen automatically via useAuth redirect above
      navigate(returnTo, { replace: true });
    } catch (err) {
      const authError = err as AuthError;
      let errorMessage = "אירעה שגיאה. נסה שוב.";

      switch (authError.code) {
        case "auth/invalid-email":
          errorMessage = "כתובת אימייל לא תקינה.";
          break;
        case "auth/user-disabled":
          errorMessage = "חשבון המשתמש הושבת.";
          break;
        case "auth/user-not-found":
          errorMessage = "משתמש לא נמצא. נסה להירשם.";
          break;
        case "auth/wrong-password":
          errorMessage = "סיסמה שגויה.";
          break;
        case "auth/email-already-in-use":
          errorMessage = "כתובת האימייל כבר בשימוש. נסה להתחבר.";
          break;
        case "auth/weak-password":
          errorMessage = "הסיסמה חלשה מדי. נסה סיסמה חזקה יותר.";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "פעולה זו לא מותרת.";
          break;
        case "auth/too-many-requests":
          errorMessage = "יותר מדי ניסיונות. נסה שוב מאוחר יותר.";
          break;
        case "auth/network-request-failed":
          errorMessage = "בעיית רשת. בדוק את החיבור לאינטרנט.";
          break;
        default:
          errorMessage = authError.message || "אירעה שגיאה. נסה שוב.";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(returnTo, { replace: true });
    } catch (err) {
      const authError = err as AuthError;
      let errorMessage = "אירעה שגיאה בהתחברות עם Google. נסה שוב.";

      switch (authError.code) {
        case "auth/popup-closed-by-user":
          errorMessage = "חלון ההתחברות נסגר. נסה שוב.";
          break;
        case "auth/popup-blocked":
          errorMessage = "חלון ההתחברות נחסם. אפשר חלונות קופצים ונסה שוב.";
          break;
        case "auth/network-request-failed":
          errorMessage = "בעיית רשת. בדוק את החיבור לאינטרנט.";
          break;
        default:
          errorMessage = authError.message || "אירעה שגיאה. נסה שוב.";
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {isSignUp ? "הרשמה" : "התחברות"}
        </h1>
        <p className={styles.subtitle}>
          {isSignUp
            ? "צור חשבון חדש כדי להתחיל"
            : "התחבר לחשבון שלך"}
        </p>

        {error && (
          <div className={styles.error} role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailAuth} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              כתובת אימייל
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              סיסמה
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              className={styles.input}
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? "טוען..." : isSignUp ? "הירשם" : "התחבר"}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>או</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={styles.googleButton}
        >
          <svg
            className={styles.googleIcon}
            viewBox="0 0 24 24"
            width="20"
            height="20"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          התחבר עם Google
        </Button>

        <div className={styles.switchMode}>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className={styles.switchButton}
            disabled={loading}
          >
            {isSignUp
              ? "כבר יש לך חשבון? התחבר"
              : "אין לך חשבון? הירשם"}
          </button>
        </div>
      </div>
    </div>
  );
}

