// hooks/use-onboarding.ts
import { useCallback, useState } from 'react'
import type { UserRole } from '@/lib/utils/roles'
import {
  hasCompletedOnboarding,
  setRoleCompleted,
  resetRoleOnboarding,
} from '@/lib/onboarding/storage'

export function useOnboarding(userId: string, role: UserRole) {
  const [hasCompleted, setHasCompleted] = useState(() =>
    hasCompletedOnboarding(userId, role)
  )

  const markComplete = useCallback(() => {
    setRoleCompleted(userId, role)
    setHasCompleted(true)
  }, [userId, role])

  const reset = useCallback(() => {
    resetRoleOnboarding(userId, role)
    setHasCompleted(false)
  }, [userId, role])

  return { hasCompleted, markComplete, reset }
}