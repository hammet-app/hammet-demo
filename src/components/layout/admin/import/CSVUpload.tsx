"use client"
import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils/utils";

type CSVUploadCardProps = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onDownloadTemplate: () => void;
};

export function CSVUploadCard({
  file,
  onFileChange,
  onDownloadTemplate,
}: CSVUploadCardProps) {

    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
      e.preventDefault();
      setDragging(true);
    }

    function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
      e.preventDefault();
      setDragging(false);
    }

    function handleDrop(e: React.DragEvent<HTMLDivElement>) {
      e.preventDefault();
      setDragging(false);

      const dropped = e.dataTransfer.files?.[0];

      if (!dropped) return;

      onFileChange(dropped);
    }

    return (
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
            "rounded-2xl border-2 border-dashed border-border bg-bg-card p-10 text-center transition-all",
            dragging
              ? "border-purple-mid bg-purple-light"
              : "border-border hover:border-purple-mid"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          hidden
          onChange={(e) =>
            onFileChange(e.target.files?.[0] ?? null)
          }
        />
        <div className="flex flex-col items-center">

          {file ? (
            <>
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-success-light text-success"
              >
                <UploadCloud size={28} />
              </div>

              <h3
                className="mt-5 text-lg font-semibold"
                style={{
                  fontFamily: "var(--font-head)",
                }}
              >
                {file.name}
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                {(file.size / 1024).toFixed(1)} KB
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="rounded-xl bg-purple-mid px-4 py-2 text-sm font-medium text-white"
                >
                  Replace
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileChange(null);
                  }}
                  className="rounded-xl border border-border px-4 -2 text-sm"
                >
                  Remove
                </button>

              </div>
            </>
          ) : (
            <>
              <div
                className="mx-auto mb-5 flex h-14 w-14 items-center justify-center 
                  rounded-2xl bg-purple-light text-purple-mid"
              >
                  <UploadCloud size={28}/>
              </div>
              <h3
                className="text-lg font-semibold"
                style={{
                  fontFamily:"var(--font-head)",
                }}
              >
                Upload Student CSV
              </h3>

              <p className="mt-2 text-sm text-text-muted">
                Drag and drop a CSV file here or choose one from your computer.
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click()
                }}
                className="mt-6 rounded-xl bg-purple-mid px-5 py-2.5 text-sm
                  font-medium text-white transition hover:opacity-90 "
              >
                Choose CSV File
              </button>

              <p className="mt-4 text-xs text-text-muted">
                CSV files only
              </p>

              <button
                onClick={onDownloadTemplate}
                className="mt-3 text-sm font-medium text-purple-mid hover:underline"
              >
                Download Template
              </button>
            </>
            )}

        </div>
    </div>
);
}