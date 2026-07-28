export function getProgress(percentage: number) {
  return (
    percentage === 0
      ? {
        title: "Let's begin!",
        description: "Your learning journey starts here."
      }
      : percentage < 40
        ? {
          title: "Good start!",
          description: "Keep building your streak."
        }
      : percentage < 70
        ? {
          title: "You're doing well",
          description: "Every lesson brings you closer."
        }
      : percentage < 90
        ? {
          title: "Great progress!",
          description: "Every lesson brings you closer."
        }
      : {
        title: "Outstanding!",
        description: "You're almost finished."
      }
  )
}