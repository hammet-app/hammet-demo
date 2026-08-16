export type FeatureFlag =
  | "lesson_coach"
  | "lesson_questions";

type FeatureConfig = {
  enabled: boolean;
  schoolIds?: string[];
};

const FEATURES: Record<FeatureFlag, FeatureConfig> = {
  lesson_coach: {
    enabled: true,
    schoolIds: (
      process.env.NEXT_PUBLIC_LESSON_COACH_SCHOOL_IDS ?? ""
    )
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  },

  lesson_questions: {
    enabled: true,
    schoolIds: (
      process.env.NEXT_PUBLIC_LESSON_QUESTIONS_SCHOOL_IDS ?? ""
    )
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  },
};

export function isFeatureEnabled(
  feature: FeatureFlag,
  schoolId?: string | null
): boolean {
  const config = FEATURES[feature];

  if (!config.enabled) {
    return false;
  }

  // Empty school list means the feature is available to everyone.
  if (!config.schoolIds?.length) {
    return true;
  }

  if (!schoolId) {
    return false;
  }

  return config.schoolIds.includes(schoolId);
}