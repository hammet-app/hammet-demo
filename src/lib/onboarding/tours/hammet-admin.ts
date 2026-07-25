import type { DriveStep } from 'driver.js'

export const hammetAdminTourSteps: DriveStep[] = [
  {
    element: '[data-tour="platform-overview"]',
    popover: {
      title: '🏢 Platform Overview',
      description: 'Monitor schools, students, active learners, and suspended institutions across the entire Hammet platform.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="school-toolbar"]',
    popover: {
      title: '🔍 Find and manage schools',
      description: 'Register a new school',
      side: 'right',
    },
  },
  {
    element: '[data-tour="school-directory"]',
    popover: {
      title: '📖 School directory',
      description: `Each card provides quick access to a school's information and management actions.`,
      side: 'right',
    },
  },
  {
    element: '[data-tour="school-card"]',
    popover: {
      title: '⬆️ Manage a school',
      description: `Open a school's profile or perform administrative actions directly from its card`,
      side: 'right',
    },
  },
    {
    popover: {
      title: '✅ You\'re all set!',
      description: 'You\'re now ready to manage schools across the Hammet platform.',
      side: 'right',
    },
  },
]