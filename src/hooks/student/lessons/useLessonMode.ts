import { useEffect } from "react";
import { LessonMode } from "@/lib/student/lessons/build";

interface UseLessonModeProps {
  status: string | null;
  lessonModule: {
    stoppedAt?: unknown;
  } | null;
  setLessonMode: React.Dispatch<React.SetStateAction<LessonMode>>;
}

export function useLessonMode({
  status,
  lessonModule,
  setLessonMode,
}: UseLessonModeProps) {
  useEffect(() => {
    if (status === "approved" || status === "submitted") {
      setLessonMode(LessonMode.REVIEW);
    } else if (status === "flagged") {
      setLessonMode(LessonMode.CORRECTION);
    } else {
      setLessonMode(
        lessonModule?.stoppedAt
          ? LessonMode.PROGRESS
          : LessonMode.FIRST
      );
    }
  }, [status, lessonModule?.stoppedAt, setLessonMode]);
}