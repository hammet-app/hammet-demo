"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { bulkRegisterStudents } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/api-client";
import { PageShell } from "@/components/layout/common/PageShell";
import { Alert } from "@/components/ui/alert";
import { BulkRegisterRequest, BulkRegisterResponse, BulkError } from "@/lib/api/types";
import { 
  ImportMethodTabs, 
  CSVUploadCard, 
  CSVPreviewCard, 
  CSVPasteCard, 
  BulkImportSuccessCard,
  ImportStepper
} from "@/components/layout/admin/import";
import { 
  parseCSV, 
  PreviewError, 
  PreviewStudent, 
  validateCSV 
} from "@/lib/admin/import";

export default function BulkImportPage() {
  const { accessToken, refreshToken } = useAuth();

  const [csvText, setCsvText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BulkRegisterResponse | null>(null);
  const [globalErrors, setGlobalErrors] = useState<BulkError[]>([]);
  const [method, setMethod] = useState<"upload" | "paste">("upload");
  const [preview, setPreview] = useState<PreviewStudent[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [expandTrigger, setExpandTrigger] = useState<number>(0);

  const ready =
    preview.filter(
        s => s.errors.length === 0
    ).length;

  const issues =
      preview.length - ready;

  function isBulkError(value: unknown): value is BulkError {
    return (
      typeof value === "object" &&
      value !== null &&
      "row" in value &&
      "message" in value
    );
  }

  function downloadCSVTemplate() {
    const content = `full_name,email,class_level,class_arm,parent_email,parent_phone,date_of_birth
      John Doe,john@example.com,SSS1,A,parent@example.com,+2348012345678,2010-05-14
      Jane Smith,jane@example.com,JSS2,B,mum@example.com,+2348098765432,2012-08-22`;

    const blob = new Blob([content], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "hammet-student-import-template.csv";
    a.click();

    URL.revokeObjectURL(url);
  }

  async function buildPreview(text: string) {
    const parsed = parseCSV(text);

    const validated = validateCSV(
      parsed
    );

    setPreview(validated);
  }

  async function handleFile(file: File | null) {
    setFile(file);

    if (!file) {
      setPreview([]);
      return;
    }

    const text = await file.text();
    setCsvText(text)

    await buildPreview(text);
  }

  async function handleSubmit() {
    if (!csvText.trim() || !accessToken) return;

    setSubmitting(true);
    setGlobalErrors([]);
    setResult(null);

    const students = preview.map(
      ({
        row,
        errors,
        ...student
      }) => student
    )
    

    try {
      const res = await bulkRegisterStudents({ students: students } satisfies BulkRegisterRequest, accessToken, refreshToken);
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        const errorMap = new Map<number, PreviewError[]>()
        const backendErrors = err.details ?? []
        const rowErrors: BulkError[] = [];
        const globalErrors: BulkError[] = [];
            
        if (Array.isArray(backendErrors)) {
          backendErrors.forEach(error => {
            if (!isBulkError(error)) return;
            if (error.row === undefined) {
                globalErrors.push(error);
                return;
            }
            rowErrors.push(error);
            const existing =
              errorMap.get(error.row) ?? [];
            existing.push({
              source: "backend",
              message: error.message,
            });

            errorMap.set(
              error.row,
              existing,
            );
          });
        };
        setPreview(previous => 
          previous.map(student => ({
            ...student,

            errors: [
              ...student.errors.filter(
                error => error.source === "frontend"
              ),
              ...(errorMap.get(student.row) ?? [])
            ]
          }))
        )
        setExpandTrigger(previous => previous + 1)
        setGlobalErrors([
          ...globalErrors,
          { message: err.message },
        ]);
      } else if (err instanceof Error) {
        setGlobalErrors([{message: `Unable to connect. ${err.message}`}]);
      }

    } finally {
      setSubmitting(false);
    }
  }

  function downloadCSV() {
    if (!result?.codes.length) return;

    const rows = result.codes.map(
      (s) => `${s.fullName},${s.email},${s.code}`
    );

    const content = `full_name,email,code\n${rows.join("\n")}`;

    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
  }

  const currentStep =
    submitting
      ? "importing"
      : preview.length > 0
      ? "review"
      : "upload";

  return (
    <PageShell title="Bulk Import Students" rounded>
      <div className="max-w-2xl flex flex-col gap-6">

        {result ? (
          <BulkImportSuccessCard
            result={result}
            onDownloadCSV={downloadCSV}
            onImportAgain={() => {
              setResult(null);
              setPreview([]);
              setCsvText("");
              setFile(null);
              setMethod("upload")
            }}
          />
        
        ): (
          <div className="flex flex-col gap-6">
            <ImportStepper current={currentStep} />
            {globalErrors.length > 0 && (
              <Alert variant="error" title="Import Failed">
                <ul className="space-y-1">
                  {globalErrors.map(error => (
                    <li key={error.message}>
                      • {error.message}
                    </li>
                  ))}
                </ul>
              </Alert>
            )}
            <div>
              <h2
                className="text-lg font-semibold text-text-primary"
                style={{
                  fontFamily:"var(--font-head)",
                }}
              >
                Import Students
              </h2>
              
              <p className="mt-1 text-sm text-text-muted">
                Import multiple students using a CSV file or by pasting CSV content.
              </p>

            </div>

            <ImportMethodTabs
              value={method}
              onChange={setMethod}
            />

            {method === "upload" ? (
              <CSVUploadCard
                file={file}
                onFileChange={handleFile}
                onDownloadTemplate={downloadCSVTemplate}
              />
            ): (
              <CSVPasteCard
                value={csvText}
                onChange={(text) => {
                  setCsvText(text)
                  buildPreview(text);
                }}
              />
            )}

            {preview.length > 0 && (
              <CSVPreviewCard
                key={expandTrigger}
                students={preview}
              />
            )}

            <button
              onClick={handleSubmit}
              disabled={
                ready === 0 ||
                issues > 0 ||
                submitting
              }
              className="inline-flex items-center justify-center gap-2 self-end rounded-xl
                bg-purple-mid px-6 py-3 text-sm font-medium text-white transition-all
                duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-mid/20
                active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50
                disabled:hover:translate-y-0 disabled:hover:shadow-none
              "
            >
             {submitting ?(
              <>
                <RefreshCw
                  size={16}
                  className="animate-spin"
                />
                Importing...
              </>
             ) :(
              `Import ${ready} Student${ready !== 1 ? "s" : ""}`
             )} 
            </button>

          </div>
        )}
      </div>
    </PageShell>
  );
}