import type { DriveStep } from 'driver.js'

import { REFLECTION_MAX, REFLECTION_MIN } from '@/lib/student/lessons/build';

export const studentDashboardSteps: DriveStep[] = [
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

export const studentLessonSteps: DriveStep[] = [
  {
    element: '[data-tour="lesson-header"]',
    popover: {
      title: "📚 Your lesson",
      description:
        "This is your lesson workspace. You'll move through the lesson one page at a time, completing each part as you go.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="lesson-progress"]',
    popover: {
      title: "📊 Track your progress",
      description:
        "This shows which page you're on and how far you've progressed through the lesson.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="lesson-page-picker"]',
    popover: {
      title: "↩️ Jump back to a page",
      description:
        "Once you've seen a page, you can come back to it here. You can only jump to pages you've already reached.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="lesson-navigation"]',
    popover: {
      title: "👣 Move through the lesson",
      description:
        "Use Next to continue and Back to return to an earlier page. On mobile, you can also swipe between pages.",
      side: "top",
    },
  },
  {
    popover: {
      title: "🚀 You're ready",
      description:
        "Work through each page at your own pace. Your progress and work are saved as you go.",
      side: "bottom",
    },
  },
];

export const studentMissionSteps: DriveStep[] = [
  {
    element: '[data-tour="mission-header"]',
    popover: {
      title: "🎯 Your mission",
      description:
        "This is what you'll be working on in this lesson. Read the mission title and description so you know what you're about to learn.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="mission-time"]',
    popover: {
      title: "⏱️ How long will it take?",
      description:
        "This is the estimated time for the lesson. You don't have to finish everything at once.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="mission-outcomes"]',
    popover: {
      title: "💡 What you'll learn",
      description:
        "These are the things you should understand or be able to do by the end of the lesson.",
      side: "top",
    },
  },
  {
    element: '[data-tour="mission-start-top"]',
    popover: {
      title: "🚀 Ready to start?",
      description:
        "You can start your lesson here at any time. You don't need to scroll all the way down.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="mission-start"]',
    popover: {
      title: "👣 Another way to start",
      description:
        "There's another Start My Lesson button here if you prefer to read everything before you begin.",
      side: "top",
    },
  },
];

export const studentActivitySteps: DriveStep[] = [
  {
    element: '[data-tour="lesson-activity"]',
    popover: {
      title: "✍️ Practice",
      description:
        "This is the practice part of your lesson. Follow the instructions and complete the activity in your own words.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="lesson-response"]',
    popover: {
      title: "📝 Your response",
      description:
        "Write your response here. Make sure you've completed the activity before moving on.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-tools"]',
    popover: {
      title: "🛠️ Tools for this lesson",
      description:
        "These are the AI tools available to help you complete this activity. Open one when the activity asks you to use a tool.",
      side: "top",
    },
  },
];

export const studentActivityNoToolsSteps: DriveStep[] = [
  {
    element: '[data-tour="lesson-activity"]',
    popover: {
      title: "✍️ Practice",
      description:
        "This is the practice part of your lesson. Follow the instructions and complete the activity in your own words.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="lesson-response"]',
    popover: {
      title: "📝 Your response",
      description:
        "Write your response here. Make sure you've completed the activity before moving on.",
      side: "top",
    },
  },
];

export const studentReflectionSteps: DriveStep[] = [
  {
    element: '[data-tour="lesson-reflection"]',
    popover: {
      title: "💭 Take a moment to reflect",
      description:
        "Think about the lesson and respond to the reflection prompt in your own words.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="lesson-reflection-response"]',
    popover: {
      title: "✍️ Write your reflection",
      description:
        "Write your response here. Take a moment to explain what you learned, noticed, or would do differently.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-reflection-word-count"]',
    popover: {
      title: "📏 Keep an eye on the word count",
      description:
        `Your reflection should be between ${REFLECTION_MIN} and ${REFLECTION_MAX} words.`,
      side: "top",
    },
  },
];

export const studentQuestionSteps: DriveStep[] = [
  {
    element: '[data-tour="lesson-question"]',
    popover: {
      title: "❓ Check your understanding",
      description:
        "Answer the question based on what you've learned so far. Take a moment to think before choosing your answer.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="lesson-question-options"]',
    popover: {
      title: "☑️ Choose your answer",
      description:
        "Select the answer you think is correct. Your choice is saved as you work.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-navigation"]',
    popover: {
      title: "➡️ Continue",
      description:
        "Once you've answered the question, use Next to continue.",
      side: "top",
    },
  },
];

export const studentTaskSteps: DriveStep[] = [
  {
    element: '[data-tour="lesson-task"]',
    popover: {
      title: "📋 Your task",
      description:
        "This is the task you need to complete for this lesson. Read the instructions carefully before submitting your work.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="lesson-task-files"]',
    popover: {
      title: "📎 Add your work",
      description:
        "Upload the files required for your task here. Your files are saved as you work, so you don't need to worry about losing them.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-task-links"]',
    popover: {
      title: "🔗 Add a link",
      description:
        "If your task requires you to share a project, website, document, or other online work, you can add its link here.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-navigation"]',
    popover: {
      title: "➡️ Continue",
      description:
        "Once you've completed the task, use Next to continue through the lesson.",
      side: "top",
    },
  },
];

export const studentAiFormSteps: DriveStep[] = [
  {
    element: '[data-tour="lesson-ai-form"]',
    popover: {
      title: "🤖 AI check-in",
      description:
        "This short check-in helps us understand how you used AI during this lesson.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="lesson-ai-used"]',
    popover: {
      title: "Did you use AI?",
      description:
        "Start by telling us whether you used an AI tool while completing this lesson.",
      side: "top",
    },
  },
];

export const studentAiNoBranchSteps: DriveStep[] = [
  {
    element: '[data-tour="lesson-ai-no-reason"]',
    popover: {
      title: "Why didn't you use AI?",
      description:
        "Choose the reason that best explains why you didn't use an AI tool for this lesson.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-navigation"]',
    popover: {
      title: "➡️ Continue",
      description:
        "Once you've completed the check-in, use Next to continue.",
      side: "top",
    },
  },
];

export const studentAiYesBranchSteps: DriveStep[] = [
  {
    element: '[data-tour="lesson-ai-tool"]',
    popover: {
      title: "🛠️ Which AI did you use?",
      description:
        "Select the AI tool you used for this lesson. The available tools are shown here.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-ai-task"]',
    popover: {
      title: "🎯 What did you use it for?",
      description:
        "Briefly describe what you asked the AI to help you with.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-ai-prompt"]',
    popover: {
      title: "💬 Your prompt",
      description:
        "Tell us whether you used the original prompt or changed it before using it.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-ai-rating"]',
    popover: {
      title: "⭐ Rate your experience",
      description:
        "Rate how useful your experience with the AI was. You can also leave an optional comment.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-navigation"]',
    popover: {
      title: "➡️ Continue",
      description:
        "Once you've completed the check-in, use Next to continue.",
      side: "top",
    },
  },
];

export const studentSubmitSteps: DriveStep[] = [
  {
    element: '[data-tour="lesson-submit"]',
    popover: {
      title: "✅ You're almost done",
      description:
        "This is the end of the lesson. Review the summary of the work you've completed before submitting.",
      side: "bottom",
    },
  },
  {
    element: '[data-tour="lesson-submit-summary"]',
    popover: {
      title: "📋 Your lesson summary",
      description:
        "This shows the parts of the lesson you've completed, including activities, reflections, tasks, and the AI check-in.",
      side: "top",
    },
  },
  {
    element: '[data-tour="lesson-navigation"]',
    popover: {
      title: "📤 Submit your lesson",
      description:
        "When you're ready, click here to submit your lesson.",
      side: "top",
    },
  },
];