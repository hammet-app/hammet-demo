// hooks/useModuleLoader.ts
import { EMPTY_AI_FORM } from "@/components/cards/student/lessons";
import { studentApi } from "@/lib/api/student";
import { CurriculumModule, ModulesResponse, PreviewLink, PreviewLinkState, Submission, TaskFilesState, TaskLinksState } from "@/lib/api/types";
import { getDraftForModule, getFilesForPendingSubmissions, getLinks } from "@/lib/db";
import { LessonView } from "@/lib/student/lessons/build";
import { AuthUser } from "@/lib/utils/roles";
import { useEffect, useState } from "react";


type UseModuleLoaderProps = {
  user: AuthUser | null;
  moduleId: string;
  accessToken: string | null;
  refreshToken: () => Promise<string|null>;
};

export function useModuleLoader({
  user,
  moduleId,
  accessToken,
  refreshToken,
}: UseModuleLoaderProps) {
  const [lessonModule, setModule] = useState<CurriculumModule | null>(null);
  const [allModules, setAllModules] = useState<ModulesResponse["modules"]>([]);
  const [loadState, setLoadState] =
    useState<"loading" | "ready" | "error">("loading");
  const [hasDispute, setHasDispute] = useState<boolean>(false);

  const [initialData, setInitialData] = useState({
    reflectionText: "",
    activityText: "",
    status: null as string | null,
    aiForm: EMPTY_AI_FORM,
    taskFiles: {} as TaskFilesState,
    taskLinks: {} as TaskLinksState,
    previewLinks: [] as PreviewLinkState,
    lessonView: LessonView.MISSION,
    existingSubmission: null as Submission | null
  })

  let reflectionText = "";
  let activityText = "";
  let status = null;
  let aiForm = EMPTY_AI_FORM;
  let lessonView = LessonView.MISSION;
  let existingSubmission = null
  let previewLinks: PreviewLinkState = [];
  let taskFiles = {};
  let taskLinks = {};


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
  
  const addPreviews = (previews?: PreviewLink[]) => {
    if (!previews) return;

    const existing = new Set(previewLinks.map(previewKey));

    previewLinks = [
      ...previewLinks,
      ...previews.filter((p) => !existing.has(previewKey(p))),
    ];
  };

  useEffect(() => {
    if (!user) return;
    if (!accessToken || !user.classLevel || !user.term) return;

    let cancelled = false;

    async function load() {
      try {
        const [mod, list, history, dispute] = await Promise.all([
          studentApi.getModule(moduleId, accessToken!, refreshToken),
          studentApi.getModules(
            user!.term!,
            user!.classLevel!,
            accessToken!,
            refreshToken
          ),
          studentApi
            .getSubmissions(accessToken!, refreshToken)
            .catch(() => ({ submissions: [] })),
          studentApi
            .getDispute(moduleId, accessToken!, refreshToken)
        ]);

        if (cancelled) return;

        setHasDispute(dispute)
        setModule(mod);
        setAllModules(list.modules);

        const existing =
          history.submissions.find((s) => s.moduleId === moduleId) ?? null;

        existingSubmission = existing;

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

        status = (existing?.status ?? null);

        if (existing?.status === "flagged") {
          reflectionText = localDraft?.reflectionText ?? existing.reflectionText ?? ""
          
          activityText = localDraft?.activityText ?? existing.activityText ?? ""
          
          aiForm = localDraft?.aiForm ?? existing.aiForm ?? EMPTY_AI_FORM
          lessonView = LessonView.LESSON
        } else {
          const source = existing ?? localDraft;

          if (source) {
            reflectionText = source.reflectionText ?? ""
            activityText = source.activityText ?? ""
            aiForm = source.aiForm ?? EMPTY_AI_FORM

            addPreviews(existing?.fileUrls ?? undefined);
            addPreviews(existing?.otherUrls ?? undefined);

            taskFiles = recovered
            taskLinks = recoveredLinks
            lessonView = LessonView.LESSON
          } else {
            lessonView = LessonView.MISSION
          }
        }

        setInitialData({
          reflectionText,
          activityText,
          status,
          aiForm,
          taskFiles: recovered,
          taskLinks: recoveredLinks,
          previewLinks,
          lessonView,
          existingSubmission: existing,
          
        })

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
    lessonModule,
    hasDispute,
    allModules,
    initialData,
    loadState,
  };
}