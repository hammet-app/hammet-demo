import { useEffect, useRef } from "react";
import { StepperPage } from "@/lib/student/lessons/build";

interface UseResumeLessonProps {
  lessonModule: {
    stoppedAt?: string | null;
  } | null;
  pages: StepperPage[];
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

export function useResumeLesson({
  lessonModule,
  pages,
  setCurrentPage,
}: UseResumeLessonProps) {
  const hasResumedRef = useRef(false);
  useEffect(() => {
    if (hasResumedRef.current) return;
    if (!lessonModule || pages.length === 0) return;
    if (!lessonModule.stoppedAt) return;

    const resumeIdx = pages.findIndex(
      (p) =>
        (p.kind === "content" ||
          p.kind === "activity" ||
          p.kind === "reflection") &&
        p.sectionId === lessonModule.stoppedAt
    );

    if (resumeIdx !== -1) {
      hasResumedRef.current = true;

      queueMicrotask(() => {
        setCurrentPage(resumeIdx);
      });
    }
  }, [lessonModule?.stoppedAt, pages, setCurrentPage]);
}