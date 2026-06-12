// lib/onboarding/tours/school-admin.ts
import type { DriveStep } from 'driver.js'

export const schoolAdminTourSteps: DriveStep[] = [
  {
    element: '[data-tour="admin-dashboard"]',
    popover: {
      title: '🏠 Dashboard',
      description: 'Your command centre — Register students, Update students and more.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="admin-students"]',
    popover: {
      title: '🏫 Students',
      description: 'View, manage, and monitor every student enrolled at your school.',
      side: 'right',
    },
  },
]