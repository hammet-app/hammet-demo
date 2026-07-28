"use client";

type ImportMethod = "upload" | "paste";

type ImportMethodTabsProps = {
  value: ImportMethod;
  onChange: (value: ImportMethod) => void;
};

export function ImportMethodTabs({
  value,
  onChange,
}: ImportMethodTabsProps) {
  return (
    <div className="inline-flex rounded-xl border border-border bg-bg-card p-1">
      <button
        onClick={() => onChange("upload")}
        className={`
          rounded-lg
          px-4
          py-2
          text-sm
          font-medium
          transition-all
          ${
            value === "upload"
              ? "bg-purple-light text-purple-mid"
              : "text-text-secondary hover:text-text-primary"
          }
        `}
      >
        Upload CSV
      </button>

      <button
        onClick={() => onChange("paste")}
        className={`
          rounded-lg
          px-4
          py-2
          text-sm
          font-medium
          transition-all
          ${
            value === "paste"
              ? "bg-purple-light text-purple-mid"
              : "text-text-secondary hover:text-text-primary"
          }
        `}
      >
        Paste CSV
      </button>
    </div>
  );
}