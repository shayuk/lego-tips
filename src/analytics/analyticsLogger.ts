/**
 * Analytics Event Logger
 * Logs events to Firestore for admin analytics dashboard
 */

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";

export type AnalyticsEventType = 
  | "page_view" 
  | "tip_selection" 
  | "ai_generate" 
  | "error";

export interface AnalyticsEvent {
  type: AnalyticsEventType;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  data?: Record<string, unknown>;
}

/**
 * Log an analytics event to Firestore
 */
export async function logAnalyticsEvent(
  type: AnalyticsEventType,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    const user = auth.currentUser;
    
    const eventData: Omit<AnalyticsEvent, "timestamp"> & { timestamp: unknown } = {
      type,
      timestamp: serverTimestamp(),
      userId: user?.uid,
      userEmail: user?.email || undefined,
      data: data || {},
    };

    await addDoc(collection(db, "analytics_events"), eventData);
    console.log(`📊 Analytics event logged: ${type}`, data);
  } catch (error) {
    // Don't throw - analytics logging should never break the app
    console.error("❌ Failed to log analytics event:", error);
  }
}

