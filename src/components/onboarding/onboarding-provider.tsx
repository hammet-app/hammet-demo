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
import { useTour } from '@/hooks/use-tour'

interface OnboardingContextValue {
    startTour: () => void;
    resetAndStartTour: () => void;
    hasCompleted: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue>({
  startTour: () => {},
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
  const { hasCompleted, markComplete, reset } = useOnboarding(userId, role)

  const { startTour } = useTour({ role, onComplete: markComplete })

  // Auto-trigger on first login
  useEffect(() => {
    if (hasCompleted) return;

    const timer = setTimeout(() => {
        startTour();
    }, TOUR_DELAY);

    return () => clearTimeout(timer);
  }, [hasCompleted, startTour]);
  // intentionally not re-running when startTour ref changes

  const resetAndStartTour = useCallback(() => {
    reset()
    setTimeout(startTour, 50)
  }, [reset, startTour])

  return (
    <OnboardingContext.Provider value={{ startTour, resetAndStartTour, hasCompleted }}>
      {children}
    </OnboardingContext.Provider>
  )
}