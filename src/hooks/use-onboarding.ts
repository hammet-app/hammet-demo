import { useCallback, useState } from "react";
import type { TourId } from "@/hooks/use-tour";
import {
  hasCompletedTour,
  resetTourOnboarding,
  setTourCompleted,
} from "@/lib/onboarding/storage";
import { UserRole } from "@/lib/utils/roles";

export function useOnboarding(
  userId: string,
  tourId: TourId
) {
  const [hasCompleted, setHasCompleted] = useState(() =>
    hasCompletedTour(userId, tourId)
  );

  const markComplete = useCallback(() => {
    setTourCompleted(userId, tourId);
    setHasCompleted(true);
  }, [userId, tourId]);

  const reset = useCallback(() => {
    resetTourOnboarding(userId, tourId);
    setHasCompleted(false);
  }, [userId, tourId]);

  return {
    hasCompleted,
    markComplete,
    reset,
  };
}