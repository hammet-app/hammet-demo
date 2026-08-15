import type { DriveStep } from 'driver.js'

export const schoolDashboardSteps: DriveStep[] = [
  {
    element: '[data-tour="school-hero"]',
    popover: {
      title: '🏠 Welcome to your dashboard',
      description: `This is your school's control center where you can manage students, monitor activity, and keep the academic session running smoothly.`,
      side: 'right',
    },
  },
  {
    element: '[data-tour="school-overview"]',
    popover: {
      title: '🏫 School Overview',
      description: 'View important information about your school, including the current academic session and term dates.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="needs-attention"]',
    popover: {
      title: '⚠️ Needs your attention',
      description: 'Review pending invitations, student submissions, and capacity issues that may require action.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="student-management"]',
    popover: {
      title: '👥 Manage students',
      description: 'Quickly register students individually or import an entire class at once.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="academic-tools"]',
    popover: {
      title: '📚 Academic tools',
      description: 'Browse curriculum modules and update your school\'s academic term whenever necessary.',
      side: 'right',
    },
  },
]