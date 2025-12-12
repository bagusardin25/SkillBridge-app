import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { addLearningTime } from "@/lib/api";

const SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to track learning time while user is active on the page.
 * - Pauses when tab is hidden
 * - Saves every 5 minutes
 * - Saves on page unload/unmount
 */
export function useLearningTimeTracker() {
  const { user, isAuthenticated } = useAuthStore();
  const startTime = useRef<number>(Date.now());
  const accumulatedTime = useRef<number>(0);
  const isVisible = useRef<boolean>(!document.hidden);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const userId = user.id;

    const saveTime = async () => {
      const now = Date.now();
      if (isVisible.current) {
        accumulatedTime.current += now - startTime.current;
      }
      startTime.current = now;

      const minutes = Math.floor(accumulatedTime.current / 60000);
      if (minutes > 0) {
        try {
          await addLearningTime(userId, minutes);
          accumulatedTime.current = accumulatedTime.current % 60000; // Keep remainder
        } catch (err) {
          console.error("Failed to save learning time:", err);
        }
      }
    };

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden) {
        // Tab became hidden - accumulate time and pause
        if (isVisible.current) {
          accumulatedTime.current += now - startTime.current;
        }
        isVisible.current = false;
      } else {
        // Tab became visible - restart timer
        startTime.current = now;
        isVisible.current = true;
      }
    };

    // Reset start time when hook initializes
    startTime.current = Date.now();
    accumulatedTime.current = 0;

    const interval = setInterval(saveTime, SAVE_INTERVAL);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", saveTime);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", saveTime);
      // Save accumulated time on cleanup
      saveTime();
    };
  }, [isAuthenticated, user?.id]);
}
