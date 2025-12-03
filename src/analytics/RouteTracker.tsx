import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { logEvent } from "firebase/analytics";
import { analytics } from "../firebase";
import { logAnalyticsEvent } from "./analyticsLogger";

export function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Log to Firebase Analytics (if available)
    if (analytics) {
      logEvent(analytics, "page_view", {
        page_path: path,
      });
    }

    // Log to Firestore for admin dashboard
    logAnalyticsEvent("page_view", {
      page_path: path,
    });

    console.log("📊 page_view:", path);
  }, [location]);

  return null;
}
