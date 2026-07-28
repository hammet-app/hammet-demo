import { CurriculumModuleBlock } from "@/lib/api/types";

type BlockEditorProps = {
  block: CurriculumModuleBlock;
  onChange: (value: string) => void;
};

export function BlockEditor({
  block,
  onChange,
}: BlockEditorProps) {
  const label = block.type.replace("_", " ");

  switch (block.type) {

    case "subheading":
      return (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </label>

          <input
            className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-[var(--color-purple)]"
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );

    default:
      return (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {label}
          </label>

          <textarea
            rows={6}
            className="w-full rounded-lg border border-gray-200 px-4 py-3 resize-y outline-none focus:ring-2 focus:ring-[var(--color-purple)]"
            value={block.content}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      );
  }
}