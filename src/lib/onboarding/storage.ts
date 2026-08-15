import type { TourId } from "@/hooks/use-tour";

export interface TourOnboardingState {
  completed: boolean;
  completedAt: string | null;
}

export type OnboardingState = Partial<
  Record<TourId, TourOnboardingState>
>;

const KEY = (userId: string) => `hammet:onboarding:${userId}`;

export function getOnboardingState(userId: string): OnboardingState {
  try {
    const raw = localStorage.getItem(KEY(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function setTourCompleted(
  userId: string,
  tourId: TourId
): void {
  try {
    const state = getOnboardingState(userId);

    state[tourId] = {
      completed: true,
      completedAt: new Date().toISOString(),
    };

    localStorage.setItem(KEY(userId), JSON.stringify(state));
  } catch {
    // best-effort
  }
}

export function resetTourOnboarding(
  userId: string,
  tourId: TourId
): void {
  try {
    const state = getOnboardingState(userId);

    state[tourId] = {
      completed: false,
      completedAt: null,
    };

    localStorage.setItem(KEY(userId), JSON.stringify(state));
  } catch {
    // best-effort
  }
}

export function hasCompletedTour(
  userId: string,
  tourId: TourId
): boolean {
  return getOnboardingState(userId)[tourId]?.completed ?? false;
}