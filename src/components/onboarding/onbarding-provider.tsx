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
  startTour: () => void
  resetAndStartTour: () => void
}

const OnboardingContext = createContext<OnboardingContextValue>({
  startTour: () => {},
  resetAndStartTour: () => {},
})

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
    if (!hasCompleted) {
      // Small delay so the layout has painted before driver.js tries to find elements
      const t = setTimeout(startTour, 800)
      return () => clearTimeout(t)
    }
  }, [hasCompleted]) // eslint-disable-line react-hooks/exhaustive-deps
  // intentionally not re-running when startTour ref changes

  const resetAndStartTour = useCallback(() => {
    reset()
    setTimeout(startTour, 50)
  }, [reset, startTour])

  return (
    <OnboardingContext.Provider value={{ startTour, resetAndStartTour }}>
      {children}
    </OnboardingContext.Provider>
  )
}