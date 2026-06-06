// lib/onboarding/storage.ts
// localStorage-backed onboarding state, keyed by userId.
// Schema is designed to mirror a future JSONB column on users table.

import type { UserRole } from '@/lib/utils/roles'

export interface RoleOnboardingState {
  completed: boolean
  completedAt: string | null
}

export type OnboardingState = Partial<Record<UserRole, RoleOnboardingState>>

const KEY = (userId: string) => `hammet:onboarding:${userId}`

export function getOnboardingState(userId: string): OnboardingState {
  try {
    const raw = localStorage.getItem(KEY(userId))
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function setRoleCompleted(userId: string, role: UserRole): void {
  try {
    const state = getOnboardingState(userId)
    state[role] = { completed: true, completedAt: new Date().toISOString() }
    localStorage.setItem(KEY(userId), JSON.stringify(state))
  } catch {
    // best-effort
  }
}

export function resetRoleOnboarding(userId: string, role: UserRole): void {
  try {
    const state = getOnboardingState(userId)
    state[role] = { completed: false, completedAt: null }
    localStorage.setItem(KEY(userId), JSON.stringify(state))
  } catch {
    // best-effort
  }
}

export function hasCompletedOnboarding(userId: string, role: UserRole): boolean {
  return getOnboardingState(userId)[role]?.completed ?? false
}