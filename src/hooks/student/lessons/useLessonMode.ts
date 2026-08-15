import { useEffect } from "react";
import { LessonMode } from "@/lib/student/lessons/build";

interface UseLessonModeProps {
  status: string | null;
  stoppedAt?: string | null
  setLessonMode: React.Dispatch<React.SetStateAction<LessonMode>>;
}

export function useLessonMode({
  status,
  stoppedAt,
  setLessonMode,
}: UseLessonModeProps) {
  useEffect(() => {
    if (status === "approved" || status === "submitted") {
      setLessonMode(LessonMode.REVIEW);
    } else if (status === "flagged") {
      setLessonMode(LessonMode.CORRECTION);
    } else {
      setLessonMode(
        stoppedAt
          ? LessonMode.PROGRESS
          : LessonMode.FIRST
      );
    }
  }, [status, stoppedAt, setLessonMode]);
}