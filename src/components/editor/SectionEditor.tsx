import { CurriculumModuleBlock, CurriculumSection } from "@/lib/api/types";

import { Card } from "@/components/cards/common/Card";
import { BlockEditor } from "./BlockEditor";

type SectionEditorProps = {
    section: CurriculumSection;
    index: number;
    onHeadingChange: (value: string) => void;
    onBlockChange: (blockId: string, value: string) => void;
};

export function SectionEditor({
  section,
  index,
  onHeadingChange,
  onBlockChange,
}: SectionEditorProps) {
  return (
    <div className="flex flex-col gap-4">

      <div className="flex flex-col gap-1">

        <h2 className="text-xl font-semibold">
          Section {index + 1}
        </h2>

        {section.heading && (
          <div className="flex flex-col gap-1">

            <label className="text-sm font-medium">
                Section Heading
            </label>

            <input
              className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-[var(--color-purple)]"
              value={section.heading ?? ""}
              onChange={(e) => onHeadingChange(e.target.value)}
            />
          </div>

        )}

      </div>

      {section.blocks.map((block) => (
        <Card key={block.id}>
            <BlockEditor
                block={block}
                onChange={(value) => onBlockChange(block.id!, value)}
            />
        </Card>
      ))}

    </div>
  );
}