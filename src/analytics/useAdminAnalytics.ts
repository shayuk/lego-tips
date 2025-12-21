/**
 * Admin Analytics Hook
 * Fetches and aggregates analytics data for admin dashboard
 */

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

export interface AdminAnalytics {
  activeUsersThisWeek: number;
  topPages: { path: string; count: number }[];
  topTips: { tipId: string; title: string; count: number }[];
  aiGenerationsThisWeek: number;
  recentErrors: { timestamp: string; message: string }[];
}

interface AnalyticsEvent {
  id: string;
  type: string;
  userId?: string;
  userEmail?: string;
  timestamp?: Timestamp | null;
  data?: Record<string, unknown>;
}

export function useAdminAnalytics(): {
  analytics: AdminAnalytics | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
} {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const refresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const oneWeekAgoTimestamp = Timestamp.fromDate(oneWeekAgo);

        // Fetch all events from the last week
        const eventsQuery = query(
          collection(db, "analytics_events"),
          where("timestamp", ">=", oneWeekAgoTimestamp),
          orderBy("timestamp", "desc")
        );

        const eventsSnapshot = await getDocs(eventsQuery);
        const events: AnalyticsEvent[] = eventsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: (data.type as string) || "",
            userId: data.userId as string | undefined,
            userEmail: data.userEmail as string | undefined,
            timestamp: data.timestamp as Timestamp | null | undefined,
            data: data.data as Record<string, unknown> | undefined,
          };
        });

        // Calculate active users this week
        const uniqueUserIds = new Set<string>();
        events.forEach((event) => {
          if (event.userId) {
            uniqueUserIds.add(event.userId);
          }
        });
        const activeUsersThisWeek = uniqueUserIds.size;

        // Calculate most visited pages
        const pageViews = events.filter((e) => e.type === "page_view");
        const pageCounts: Record<string, number> = {};
        pageViews.forEach((event) => {
          const path = (event.data?.page_path as string) || "unknown";
          pageCounts[path] = (pageCounts[path] || 0) + 1;
        });
        const topPages = Object.entries(pageCounts)
          .map(([path, count]) => ({ path, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Calculate most selected tips
        const tipSelections = events.filter((e) => e.type === "tip_selection");
        const tipCounts: Record<string, { title: string; count: number }> = {};
        tipSelections.forEach((event) => {
          const tipId = (event.data?.tipId as string) || "unknown";
          const tipTitle = (event.data?.tipTitle as string) || tipId;
          if (!tipCounts[tipId]) {
            tipCounts[tipId] = { title: tipTitle, count: 0 };
          }
          tipCounts[tipId].count += 1;
        });
        const topTips = Object.entries(tipCounts)
          .map(([tipId, tip]) => ({
            tipId,
            title: tip.title,
            count: tip.count,
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Calculate AI generations this week
        const aiGenerations = events.filter((e) => e.type === "ai_generate");
        const aiGenerationsThisWeek = aiGenerations.length;

        // Get recent errors
        const errorEvents = events.filter((e) => e.type === "error").slice(0, 20);
        const recentErrors = errorEvents.map((event) => {
          const timestamp = event.timestamp instanceof Timestamp 
            ? event.timestamp.toDate() 
            : new Date();
          const message = (event.data?.message as string) || (event.data?.error as string) || "Unknown error";
          return {
            timestamp: timestamp.toISOString(),
            message,
          };
        });

        setAnalytics({
          activeUsersThisWeek,
          topPages,
          topTips,
          aiGenerationsThisWeek,
          recentErrors,
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch analytics"));
        console.error("❌ Error fetching analytics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [refreshKey]);

  return { analytics, isLoading, error, refresh };
}

