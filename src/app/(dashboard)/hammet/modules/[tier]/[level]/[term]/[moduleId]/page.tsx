"use client"

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { CurriculumModule } from "@/lib/api/types";
import { ListSkeleton, PageShell } from "@/components/layout/common/PageShell";
import { useAuth } from "@/lib/auth/auth-context";
import { Alert } from "@/components/ui";
import { editModule, getModule } from "@/lib/api/hammet";
import { ApiError } from "@/lib/api/api-client";
import { Save } from "lucide-react";
import { Card } from "@/components/cards/common/Card";
import { SectionEditor } from "@/components/editor";

const TERM_LABELS: Record<number, string> = {
  1: "First Term",
  2: "Second Term",
  3: "Third Term",
};

export default function HammetModuleEditor() {
  
  const { accessToken, refreshToken } = useAuth()

  const params = useParams<{ tier: string, level: string, term: string, moduleId: string }>();
  const tier = decodeURIComponent(params.tier)
  const level = decodeURIComponent(params.level)
  const term = Number(params.term)
  const moduleId = decodeURIComponent(params.moduleId)

  const [isLoading, setIsLoading] = useState(true);
  const [lessonModule, setLessonModule] = useState<CurriculumModule | null>(null)
  const [editableModule, setEditableModule] = useState<CurriculumModule | null>(null)
  const [error, setError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Load page
  useEffect(() => {
    if (!accessToken || !tier) return;

    getModule(tier, moduleId, accessToken, refreshToken)
      .then((res) => {
        setLessonModule(res);
        setEditableModule(res);
      })
      .catch((err: ApiError) => setError(err.message))
      .catch(() => setError("Failed to load module"))
      .finally(() => setIsLoading(false));
  }, [tier, moduleId, accessToken, refreshToken]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!hasChanges) return;

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handler)

    return () => {
      window.removeEventListener("beforeunload", handler);
    };
  }, [hasChanges])

  async function handleSave() {
    if (!accessToken || !lessonModule || !editableModule) return
    try {
      const moduleToSave = {
        ...editableModule,
        tier,
      };

      const res = await editModule(
        lessonModule.id,
        moduleToSave,
        accessToken,
        refreshToken
      );

      if (res) {
        setLessonModule(moduleToSave);
        setEditableModule(moduleToSave);
        setHasChanges(false);
      }
      
    } catch {
      setError("Failed to update module")
    }
  }

  function updateSectionHeading(
    sectionId: string,
    value: string
  ) {
    if (!editableModule) return;

    setEditableModule({
      ...editableModule,
      contentJson: {
        ...editableModule.contentJson,
        sections: editableModule.contentJson.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                heading: value,
              }
            : section
        ),
      },
    });

    setHasChanges(true)
  }

  function updateBlock(
    sectionId: string,
    blockId: string,
    value: string
  ) {
    if (!editableModule) return;

    setEditableModule({
      ...editableModule,
      contentJson: {
        ...editableModule.contentJson,
        sections: editableModule.contentJson.sections.map((section) =>
          section.id !== sectionId
            ? section
            : {
                ...section,
                blocks: section.blocks.map((block) =>
                  block.id === blockId
                    ? {
                        ...block,
                        content: value,
                      }
                    : block
                ),
              }
        ),
      },
    });

    setHasChanges(true)
  }


  return (
    <PageShell 
      title="Module Editor"
      backHref={`/hammet/modules/${tier}/${level}/${term}`}
      actions={
        <div className="flex items-center gap-3">
          <button
            disabled={!hasChanges || isLoading}
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 rounded-md bg-[var(--color-purple)] text-white text-sm font-medium hover:opacity-90 transition
            disabled:opacity-50 disabled:cursor-not-allowed hover:enabled:opacity-90"
          >
            <Save size={16} className="mr-2 shrink-0" />
            Save Changes
          </button>
        </div>
      }
    >
      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : (
        <div className="flex flex-col gap-6">
          {error && (
            <Alert variant="error">
              {error}
            </Alert>
          )}

          <Card>
            <div className="flex flex-col gap-1">
              <input
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-2xl font-semibold outline-none focus:ring-2 focus:ring-[var(--color-purple)]"
                value={editableModule?.title ?? ""}
                onChange={(e) => {
                  if (!editableModule) return;

                  setEditableModule({
                    ...editableModule,
                    title: e.target.value,
                  });
                  setHasChanges(true)
                }}
              />

              <p className="text-sm text-gray-500">
                {editableModule?.level} •{" "}
                {TERM_LABELS[editableModule?.term ?? 1]}
              </p>
            </div>
          </Card>

          {editableModule?.contentJson.sections.map((section, index) => (
            <SectionEditor
              key={section.id}
              section={section}
              index={index}
              onHeadingChange={(value) =>
                updateSectionHeading(section.id!, value)
              }
              onBlockChange={(blockId, value) =>
                updateBlock(section.id!, blockId, value)
              }
            />
          ))}

        </div>
      )}
    </PageShell>
  )
}