"use client";

import { useState } from "react";
import type { CurriculumModuleBlock } from "@/lib/api/api-types";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------

export type BlockEditorBlock = CurriculumModuleBlock & { _id: string };

const BLOCK_TYPES: CurriculumModuleBlock["type"][] = [
  "heading",
  "body",
  "activity",
  "ai_prompt",
  "reflection",
  "video_embed",
  "tool_link",
  "image",
  "subheading",
  "task"
];

const BLOCK_TYPE_LABELS: Record<CurriculumModuleBlock["type"], string> = {
  heading: "Heading",
  body: "Body text",
  activity: "Activity",
  ai_prompt: "AI Prompt",
  reflection: "Reflection",
  video_embed: "Video embed",
  tool_link: "Tool link",
  task: "Task",
  subheading: "Subheading",
  image: "Image"
};

const BLOCK_TYPE_DESCRIPTIONS: Record<CurriculumModuleBlock["type"], string> = {
  heading: "Section title",
  body: "Paragraph content",
  activity: "Student task",
  ai_prompt: "Prompt for an AI tool",
  reflection: "Written reflection",
  video_embed: "Embedded video",
  tool_link: "Link to an external tool",
  image: "An image for explaining content",
  subheading: "A section subtitle",
  task: "A task to be done by student"
};

// Which block types have extra fields beyond content
function hasUrl(type: CurriculumModuleBlock["type"]) {
  return type === "video_embed" || type === "tool_link";
}
function hasToolName(type: CurriculumModuleBlock["type"]) {
  return type === "tool_link";
}
function hasRequired(type: CurriculumModuleBlock["type"]) {
  return type === "reflection" || type === "activity";
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function makeBlock(type: CurriculumModuleBlock["type"]): BlockEditorBlock {
  return {
    _id: uid(),
    type,
    content: "",
    ...(hasUrl(type) ? { url: "" } : {}),
    ...(hasToolName(type) ? { tool_name: "" } : {}),
    ...(hasRequired(type) ? { required: false } : {}),
  };
}

// ------------------------------------------------------------------
// Block type picker dropdown
// ------------------------------------------------------------------

function BlockTypePicker({ onSelect }: { onSelect: (type: CurriculumModuleBlock["type"]) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:border-[var(--color-purple)] hover:text-[var(--color-purple)] transition w-full justify-center"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add block
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-2 bg-white border border-[var(--color-border)] rounded-2xl shadow-xl z-20 overflow-hidden">
            {BLOCK_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => {
                  onSelect(type);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-[var(--color-purple-light)] transition-colors flex items-start gap-3 group"
              >
                <div className="mt-0.5">
                  <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-purple)]">
                    {BLOCK_TYPE_LABELS[type]}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {BLOCK_TYPE_DESCRIPTIONS[type]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Individual block editor
// ------------------------------------------------------------------

function BlockEditor({
  block,
  index,
  total,
  onChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  block: BlockEditorBlock;
  index: number;
  total: number;
  onChange: (updated: BlockEditorBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}) {
  function set<K extends keyof BlockEditorBlock>(key: K, value: BlockEditorBlock[K]) {
    onChange({ ...block, [key]: value });
  }

  const isFirst = index === 0;
  const isLast = index === total - 1;

  const contentPlaceholders: Partial<Record<CurriculumModuleBlock["type"], string>> = {
    heading: "Section heading text…",
    body: "Paragraph content…",
    activity: "Describe the student task…",
    ai_prompt: "Write the prompt students will use with the AI tool…",
    reflection: "What should students reflect on?",
    video_embed: "Caption or description for this video…",
    tool_link: "Description or instructions for this tool…",
  };

  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
      {/* Block header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-page)] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--color-text-muted)] tabular-nums w-5 text-center">
            {index + 1}
          </span>
          <span className="text-xs font-semibold text-[var(--color-purple)] bg-[var(--color-purple-light)] px-2 py-0.5 rounded-md">
            {BLOCK_TYPE_LABELS[block.type]}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Move up */}
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-purple)] hover:bg-[var(--color-purple-light)] disabled:opacity-25 disabled:cursor-not-allowed transition"
            aria-label="Move up"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          {/* Move down */}
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-purple)] hover:bg-[var(--color-purple-light)] disabled:opacity-25 disabled:cursor-not-allowed transition"
            aria-label="Move down"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {/* Delete */}
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition"
            aria-label="Delete block"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Block fields */}
      <div className="p-4 flex flex-col gap-4">
        {/* Content — always present */}
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
            Content
          </label>
          <textarea
            value={block.content}
            onChange={(e) => set("content", e.target.value)}
            rows={block.type === "heading" ? 1 : 3}
            placeholder={contentPlaceholders[block.type] ?? "Content…"}
            className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)] focus:border-transparent resize-none transition"
          />
        </div>

        {/* Tool name — tool_link only */}
        {hasToolName(block.type) && (
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
              Tool name
            </label>
            <input
              type="text"
              value={block.tool_name ?? ""}
              onChange={(e) => set("tool_name", e.target.value)}
              placeholder="e.g. ChatGPT, Gemini, Perplexity…"
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)] focus:border-transparent transition"
            />
          </div>
        )}

        {/* URL — video_embed and tool_link */}
        {hasUrl(block.type) && (
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wider">
              {block.type === "video_embed" ? "Video URL" : "Tool URL"}
            </label>
            <input
              type="url"
              value={block.url ?? ""}
              onChange={(e) => set("url", e.target.value)}
              placeholder={
                block.type === "video_embed"
                  ? "https://youtube.com/watch?v=…"
                  : "https://…"
              }
              className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-page)] px-4 py-3 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-purple)] focus:border-transparent transition font-mono"
            />
          </div>
        )}

        {/* Required toggle — reflection and activity */}
        {hasRequired(block.type) && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Required</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Student must complete this block to submit
              </p>
            </div>
            <button
              onClick={() => set("required", !block.required)}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                block.required ? "bg-[var(--color-purple)]" : "bg-[var(--color-border)]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  block.required ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Public API
// ------------------------------------------------------------------

export function blocksToContentJson(blocks: BlockEditorBlock[]): CurriculumModuleBlock[] {
  return blocks.map(({ _id, ...rest }) => {
    // Strip undefined optional fields to keep the JSON clean
    const block: CurriculumModuleBlock = { type: rest.type, content: rest.content };
    if (rest.url !== undefined) block.url = rest.url;
    if (rest.tool_name !== undefined) block.tool_name = rest.tool_name;
    if (rest.required !== undefined) block.required = rest.required;
    return block;
  });
}

export function contentJsonToBlocks(blocks: CurriculumModuleBlock[]): BlockEditorBlock[] {
  return blocks.map((b) => ({ ...b, _id: uid() }));
}

// ------------------------------------------------------------------
// Main component
// ------------------------------------------------------------------

export function BlockEditor2({
  blocks,
  onChange,
}: {
  blocks: BlockEditorBlock[];
  onChange: (blocks: BlockEditorBlock[]) => void;
}) {
  function addBlock(type: CurriculumModuleBlock["type"]) {
    onChange([...blocks, makeBlock(type)]);
  }

  function updateBlock(index: number, updated: BlockEditorBlock) {
    const next = [...blocks];
    next[index] = updated;
    onChange(next);
  }

  function deleteBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...blocks];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === blocks.length - 1) return;
    const next = [...blocks];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, i) => (
        <BlockEditor
          key={block._id}
          block={block}
          index={i}
          total={blocks.length}
          onChange={(updated) => updateBlock(i, updated)}
          onMoveUp={() => moveUp(i)}
          onMoveDown={() => moveDown(i)}
          onDelete={() => deleteBlock(i)}
        />
      ))}

      <BlockTypePicker onSelect={addBlock} />
    </div>
  );
}
