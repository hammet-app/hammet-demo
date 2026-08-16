'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from 'react'
import type { UserRole } from '@/lib/utils/roles'
import { useOnboarding } from '@/hooks/use-onboarding'
import { useTour, TourId } from '@/hooks/use-tour'

const DEFAULT_TOURS: Record<UserRole, TourId> = {
  student: "student-dashboard",
  school_admin: "school-dashboard",
  hammet_admin: "hammet-dashboard",
}

interface OnboardingContextValue {
    startTour: (tourId: TourId) => void;
    resetAndStartTour: () => void;
    hasCompleted: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue>({
  startTour: (tourId: TourId) => {},
  resetAndStartTour: () => {},
  hasCompleted: false
})

const TOUR_DELAY = 300;

export function useOnboardingContext() {
  return useContext(OnboardingContext)
}

interface Props {
  userId: string
  role: UserRole
  children: ReactNode
}


export function OnboardingProvider({ userId, role, children }: Props) {
  const initialTour = DEFAULT_TOURS[role]
  const { hasCompleted, markComplete, reset } = useOnboarding(userId, initialTour)

  const { startTour } = useTour({ onComplete: markComplete })

  // Auto-trigger on first login
  useEffect(() => {
    if (hasCompleted) return;

    const timer = setTimeout(() => {
        startTour(DEFAULT_TOURS[role]);
    }, TOUR_DELAY);

    return () => clearTimeout(timer);
  }, [hasCompleted, startTour]);
  // intentionally not re-running when startTour ref changes

  const resetAndStartTour = useCallback(() => {
    reset()
    setTimeout(() =>{
      startTour(DEFAULT_TOURS[role])
    }, 50)
  }, [reset, startTour])

  return (
    <OnboardingContext.Provider value={{ startTour, resetAndStartTour, hasCompleted }}>
      {children}
    </OnboardingContext.Provider>
  )
}