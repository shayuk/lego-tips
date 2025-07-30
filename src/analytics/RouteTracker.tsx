import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase"; // הנתיב שלך אם צריך להתאים

export function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    if (analytics) {
      logEvent(analytics, "page_view", {
        page_path: path,
      });
    }

    console.log("📊 page_view:", path);
  }, [location]);

  return null;
}
