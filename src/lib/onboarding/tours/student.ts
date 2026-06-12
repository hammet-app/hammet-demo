// lib/onboarding/tours/student.ts
import type { DriveStep } from 'driver.js'

export const studentTourSteps: DriveStep[] = [
  {
    element: '[data-tour="student-lessons"]',
    popover: {
      title: '📚 Your Lessons',
      description: 'All your AI literacy lessons live here. Work through them week by week.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="student-progress"]',
    popover: {
      title: '📈 Your Progress',
      description: 'Track how many lessons you\'ve completed and what\'s still ahead this term.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="student-submissions"]',
    popover: {
      title: '📝 Submissions',
      description: 'See all your submitted work and check if your teacher has approved or flagged anything.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="student-portfolio"]',
    popover: {
      title: '🎓 Your Portfolio',
      description: 'Every lesson you complete builds your digital portfolio — a verified record of your AI skills.',
      side: 'right',
    },
  },
  {
    element: '[data-tour="student-performance"]',
    popover: {
      title: '📊 Your Performance',
      description: 'Every lesson you complete gives you XP. You see a graph of your performance across lessons and activities.',
      side: 'right',
    },
  }
]