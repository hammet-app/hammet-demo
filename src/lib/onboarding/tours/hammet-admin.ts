// lib/onboarding/tours/hammet-admin.ts
import type { DriveStep } from 'driver.js'

export const hammetAdminTourSteps: DriveStep[] = [
  {
    element: '[data-tour="hammet-overview"]',
    popover: {
      title: '🏢 Platform Overview',
      description: 'Top-level metrics across all schools — submissions, approvals, and active students.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="hammet-modules"]',
    popover: {
      title: '📖 Modules',
      description: 'Browse and manage all curriculum modules across every level and term.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="hammet-upload"]',
    popover: {
      title: '⬆️ Upload Module',
      description: 'Bulk-upload new lesson content. Angel uses this to publish curriculum updates.',
      side: 'right',
    },
  },
]