import type { DriveStep } from 'driver.js'

export const studentTourSteps: DriveStep[] = [
  {
    element: '[data-tour="student-hero"]',
    popover: {
      title: '👋 Welcome to Hammet',
      description: 'This is your learning home. From here you can continue lessons, monitor your progress, and access everything you need for this term.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="continue-learning"]',
    popover: {
      title: '▶️ Continue where you left off',
      description: 'We\'ll always keep your next lesson here so you can jump back into learning with one click.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="progress-overview"]',
    popover: {
      title: '📈 Track your progress',
      description: 'See how many modules you\'ve completed this term and monitor your overall learning progress.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="student-navigation"]',
    popover: {
      title: '🧭 Explore your workspace',
      description: 'Use these shortcuts to access your lessons, progress, portfolio, and performance.',
      side: 'right',
    },
  },
  {
    popover: {
      title: '✅ You\'re ready!',
      description: 'Start learning by opening your next lesson from the Continue Learning section.',
      side: 'right',
    },
  },
]