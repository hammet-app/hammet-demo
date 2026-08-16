import { useEffect, useRef } from "react";
import { StepperPage } from "@/lib/student/lessons/build";
import { CurriculumModule } from "@/lib/api/types";

interface UseResumeLessonProps {
  currentModule: CurriculumModule,
  stoppedAt?: string | null;
  pages: StepperPage[];
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setFurthestPageSeen: React.Dispatch<React.SetStateAction<number>>;
}

export function useResumeLesson({
  currentModule,
  stoppedAt,
  pages,
  setCurrentPage,
  setFurthestPageSeen,
}: UseResumeLessonProps) {
  const hasResumedRef = useRef(false);
  useEffect(() => {
    if (hasResumedRef.current) return;
    if (!currentModule || pages.length === 0) return;
    if (!stoppedAt) return;

    const resumeIdx = pages.findIndex(
      (p) =>
        (p.kind === "content" ||
          p.kind === "activity" ||
          p.kind === "reflection") &&
        p.sectionId === stoppedAt
    );

    if (resumeIdx !== -1) {
      hasResumedRef.current = true;

      queueMicrotask(() => {
        setCurrentPage(resumeIdx);
        setFurthestPageSeen((prev) => Math.max(prev, resumeIdx))
      });
    }
  }, [currentModule, stoppedAt, pages, setCurrentPage]);
}