// hooks/useModuleLoader.ts
import { useEffect, useState } from "react";
import { EMPTY_AI_FORM } from "@/components/cards/student/lessons";
import { studentApi } from "@/lib/api/student";
import { AiFormState, CurriculumModule, ModulesResponse, PreviewLink, PreviewLinkState, Submission, TaskFilesState, TaskLinksState } from "@/lib/api/types";
import { getDraftForModule, getFilesForPendingSubmissions, getLinks } from "@/lib/db";
import { LessonView } from "@/lib/student/lessons/build";
import { AuthUser } from "@/lib/utils/roles";
import { useSubmissionStore, useModuleStore, useModuleStateStore} from "@/lib/store";

export type LessonInitialData = {
  reflectionText: string;
  activityText: string;
  status: string | null;
  aiForm: AiFormState;
  taskFiles: TaskFilesState,
  taskLinks: TaskLinksState,
  previewLinks: PreviewLinkState,
  lessonView: LessonView,
}


type UseLessonLoaderProps = {
  user: AuthUser | null;
  moduleId: string;
  accessToken: string | null;
  refreshToken: () => Promise<string|null>;
};

export function useLessonLoader({
  user,
  moduleId,
  accessToken,
  refreshToken,
}: UseLessonLoaderProps) {
  const { modules, currentModule } = useModuleStore();
  const { submission } = useSubmissionStore()
  const [loadState, setLoadState] =
    useState<"loading" | "ready" | "error">("loading");

  const [initialData, setInitialData] = useState<LessonInitialData | null>(null);

  function previewKey(preview: PreviewLink): string {
      if (preview.type === "link") {
        return preview.url;
      }
  
      const url = new URL(preview.url);
  
      // Stable object path, ignores the signed token.
      return decodeURIComponent(
        url.pathname.replace("/storage/v1/object/sign/", "")
      );
    }
  
  function addPreviews(
    current: PreviewLinkState,
    previews?: PreviewLink[]
  ): PreviewLinkState {
    if (!previews) return current;

    const existing = new Set(current.map(previewKey));

    return [
      ...current,
      ...previews.filter((p) => !existing.has(previewKey(p))),
    ];
  }

  useEffect(() => {
    if (!user) return;
    if (!accessToken || !user.classLevel || !user.term) return;

    let cancelled = false;

    async function load() {
      try {
        let mod = currentModule;

        if (!mod || mod.id !== moduleId) {
          await studentApi.getModule(moduleId, accessToken!, refreshToken)

          mod = useModuleStore.getState().currentModule
        }
        if (!mod) {
          throw new Error("Module was not loaded");
        }

        await studentApi
            .getSubmission(mod.id, accessToken!, refreshToken)
            .catch(() => ({ submissions: [] }))

        if (cancelled) return;

        const [localDraft, localLinks, localFiles] = await Promise.all([
          getDraftForModule(user!.id, moduleId),
          getLinks(user!.id, moduleId),
          getFilesForPendingSubmissions(user!.id, moduleId),
        ]);

        if (cancelled) return;

        const recovered: TaskFilesState = {};
        const recoveredLinks: TaskLinksState = {};

        for (const l of localLinks) {
          recoveredLinks[l.blockId] ??= [];

          recoveredLinks[l.blockId].push(
            ...l.url.map((url) => ({
              taskId: l.blockId,
              url,
            }))
          );
        }

        for (const f of localFiles) {
          recovered[f.blockId] ??= [];

          recovered[f.blockId].push({
            id: f.id,
            taskId: f.blockId,
            url: f.path,
            fileName: f.fileName,
            dexieId: f.id,
            status: f.uploadStatus === "done" ? "done" : "queued",
          });
        }

        const initial = {
          reflectionText: "",
          activityText: "",
          status: submission?.status ?? null,
          aiForm: EMPTY_AI_FORM,
          taskFiles: recovered,
          taskLinks: recoveredLinks,
          previewLinks: [] as PreviewLinkState,
          lessonView: LessonView.MISSION,
        };

        if (submission?.status === "flagged") {
          initial.reflectionText =
            localDraft?.reflectionText ?? submission.reflectionText ?? "";

          initial.activityText =
            localDraft?.activityText ?? submission.activityText ?? "";

          initial.aiForm =
            localDraft?.aiForm ?? submission.aiForm ?? EMPTY_AI_FORM;

          initial.lessonView = LessonView.LESSON;
        } else {
          const source = submission ?? localDraft;

          if (source) {
            initial.reflectionText = source.reflectionText ?? "";
            initial.activityText = source.activityText ?? "";
            initial.aiForm = source.aiForm ?? EMPTY_AI_FORM;

            initial.previewLinks = addPreviews(
              initial.previewLinks,
              submission?.fileUrls ?? undefined
            );

            initial.previewLinks = addPreviews(
              initial.previewLinks,
              submission?.otherUrls ?? undefined
            );

            initial.lessonView = LessonView.LESSON;
          }
        }

        setInitialData(initial);
        setLoadState("ready");
      } catch {
        if (!cancelled) {
          setLoadState("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    accessToken,
    moduleId,
    refreshToken,
    user?.id,
    user?.classLevel,
    user?.term,
  ]);

  return {
    currentModule,
    initialData,
    loadState,
  };
}