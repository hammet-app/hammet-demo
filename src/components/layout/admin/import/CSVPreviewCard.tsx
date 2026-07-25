import { PreviewStudent, PreviewError } from "@/lib/admin/import/types";
import { useEffect, useRef, useState } from "react";

type CSVPreviewCardProps = {
  students: PreviewStudent[];
  expandTrigger: number;
};

export function CSVPreviewCard({
  students,
  expandTrigger,
}: CSVPreviewCardProps) {
  const ready = students.filter(
    (s) => s.errors.length === 0
  ).length;

  const issues = students.length - ready;
  const [expanded, setExpanded] = useState(false)
  const rowRefs = useRef<
    Record<number, HTMLDivElement | null>
  >({});

  useEffect(() => {
    setExpanded(true);

  }, [expandTrigger])

  const visibleStudents = 
    expanded
      ? students
      : students.slice(0, 5)
  return (
    <div className="rounded-2xl border border-border bg-bg-card">
      <div className="border-b border-border p-6">
        <h3
          className="text-lg font-semibold"
          style={{
              fontFamily:
                  "var(--font-head)",
          }}
        >
          Preview
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Review students before importing.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 p-6">
        <div className="rounded-xl bg-bg-page p-4">

          <p className="text-xs uppercase text-text-muted">
              Ready
          </p>

          <p className="mt-2 text-2xl font-bold text-success">
              {ready}
          </p>
        </div>

        <div className="rounded-xl bg-bg-page p-4">
          <p className="text-xs uppercase text-text-muted">
              Issues
          </p>

          <p className="mt-2 text-2xl font-bold text-amber">
              {issues}
          </p>
        </div>

        <div className="rounded-xl bg-bg-page p-4">
          <p className="text-xs uppercase text-text-muted">
              Total
          </p>

          <p className="mt-2 text-2xl font-bold text-purple">
              {students.length}
          </p>
        </div>
      </div>

      <div className="border-t border-border">
        {visibleStudents
          .map((student) => (
            <div
              ref={(element) => {
                rowRefs.current[student.row] = element
              }}
              key={student.row}
              className="flex items-start justify-between border-b border-border p-5"
            >
              <div>
                <p className="font-semibold">
                  {student.fullName}
                </p>

                <p className="text-sm text-text-muted">
                  {student.email}
                </p>

                <p className="mt-1 text-sm text-text-secondary">
                  {student.classLevel} {student.classArm}
                </p>
              </div>
              {student.errors.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {student.errors.map(error => (
                    <span
                      key={`${error.source}-${error.message}`}
                      className={`
                          rounded-md
                          px-2
                          py-1
                          text-xs
                          text-danger-dark
                          ${error.source === "backend"
                            ? "bg-danger-light"
                            : "bg-warning-light"
                          }
                            
                      `}
                    >
                      {error.message}
                    </span>
                  ))}
                </div>
              )}
              <div>
                {student.errors.length === 0 ? (
                  <span
                    className="rounded-full bg-success-light px-3 py-1 text-xs font-medium text-success-dark"
                  >
                    Ready
                  </span>
                ) : (
                  <span
                    className="rounded-full bg-warning-light px-3 py-1 text-xs font-medium text-warning-dark"
                  >
                    {student.errors.length} issue
                  </span>

                )}
              </div>
              
            </div>
          ))
        }
        {students.length > 5 && (
          <div className="p-5 text-center">
          <button
            onClick={() => 
              setExpanded(!expanded)
            }
            className="text-sm font-medium text-purple-mid hover:underline"
          >
            {expanded
              ? "Show Less"
              : `Show All (${students.length})`
            }
          </button>
        </div>
        )}
      </div>
    </div>
  )
}

  