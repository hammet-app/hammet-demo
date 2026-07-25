"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react"
import { useAuth } from "@/lib/auth/auth-context";
import {
  getAdminStudents,
  deleteStudent,
  sendParentLink,
  revokeParentLink,
  getSchoolProfile,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/api-client";
import { resendCode } from "@/lib/api/admin";
import { PageShell, ListSkeleton } from "@/components/layout/common/PageShell";
import { SchoolProfile, type AdminStudent } from "@/lib/api/types";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/cards/common";
import { StudentDetails, ClassGroup, StudentSummary, RowAction, InFlight } from "@/components/cards/admin/student";
import { Button } from "@/components/ui";



const CLASS_LEVELS = [
  "JSS1", "JSS2", "JSS3",
  "SSS1", "SSS2", "SSS3",
] as const;

const STATUSES = ["active", "pending"] as const;

const containerVariants={
  hidden:{},

  show: {
    transition:{
      staggerChildren:.05,
    }
  }
}

const rowVariants={
  hidden:{
    opacity:0,
    y:12,
  },
  show:{
    opacity:1,
    y:0,
  }
}

function StudentRow({
  student,
  inFlight,
  onAction,
  created,
  canUseParentLink,
  expanded,
  onToggle,
}: {
  student: AdminStudent;
  inFlight: InFlight | null;
  onAction: (action: RowAction) => void;
  created?: { fullName: string; email: string; code: string };
  canUseParentLink: boolean
  expanded: boolean;
  onToggle: () => void;
}) {

  return (
    <motion.div
      variants={rowVariants}
      layout
      initial="hidden"
      animate="show"
      exit="hidden"
      whileHover={{
        y: -2,
      }}
      transition={{
        layout: {
          duration: 0.25
        },
        duration: 0.2,
      }}
      className="bg-[var(--color-bg-card)] border border-[var(--color-border)] hover:border-[var(--color-purple)]/60 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
      onClick={onToggle}
    >
      <StudentSummary student={student} expanded={expanded} />
      {/* Divider */}
      <div className="h-[1px] bg-[var(--color-border)]" />
      <StudentDetails 
        student={student} 
        inFlight={inFlight} 
        onAction={onAction}
        created={created}
        canUseParentLink={canUseParentLink}
        expanded={expanded}
      />
      
    </motion.div>
  );
}

export default function AdminStudentsPage() {
  const { accessToken, refreshToken } = useAuth();

  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inFlight, setInFlight] = useState<InFlight | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [createdMap, setCreatedMap] = useState<
    Record<string, { fullName: string; email: string; code: string }>
  >({});
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<
    Record<string, boolean>
  >(() => ({
    JSS1: true,
    JSS2: true,
    JSS3: true,
    SSS1: true,
    SSS2: true,
    SSS3: true,
  }));

  // Filter state
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [profile, setProfile] = useState<SchoolProfile>();

  useEffect(() => {
    if (!accessToken) return;
    getSchoolProfile(accessToken, refreshToken)
      .then((res) => setProfile(res))
      .catch(() => setError("Failed to load school"))
    getAdminStudents(accessToken, refreshToken)
      .then((res) => setStudents(res.students))
      .catch(() => setError("Failed to load students."))
      .finally(() => setIsLoading(false));
  }, [accessToken, refreshToken]);

  const canUseParentLink = ["premier", "global"].includes(profile?.tier!)

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return students.filter((s) => {
      const classLabel = s.classArm
        ? `${s.classLevel} ${s.classArm}`
        : s.classLevel;

      const matchQuery =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);

      const matchClass =
        !classFilter || classLabel === classFilter;

      const matchStatus =
        !statusFilter ||
        s.status.toLowerCase() === statusFilter.toLowerCase();

      return matchQuery && matchClass && matchStatus;
    });
  }, [students, query, classFilter, statusFilter]);

  const groupedStudents = useMemo(() => {
    return CLASS_LEVELS.reduce((groups, level) => {
      groups[level] = filtered.filter(
        student => student.classLevel === level
      );
      return groups
    }, {} as Record<string, AdminStudent[]>);
  }, [filtered]);

  const allExpanded = CLASS_LEVELS.reduce(
    (acc, level) => {
      acc[level] = true;
      return acc;
    },
    {} as Record<string, boolean>
  );

  const allCollpsed = CLASS_LEVELS.reduce(
    (acc, level) => {
      acc[level] = false;
      return acc;
    },
    {} as Record<string, boolean>
  );

  async function handleAction(action: RowAction) {
    if (!accessToken) return;

    setInFlight({ studentId: action.studentId, action: action.type });
    setActionError(null);

    try {
      if (action.type === "send-link") {
        try {
          const res = await sendParentLink(
            action.studentId,
            accessToken,
            refreshToken
          );
          setStudents((prev) =>
            prev.map((s) =>
              s.studentId === action.studentId
                ? { ...s, parentLinkSentAt: res.expiresAt }
                : s
            )
          );
        } catch (err) {
          if (err instanceof ApiError && err.status === 404) {
            setActionError(
              "Student has not completed any module. Please ensure that student has completed a class before attempting to send a parent link."
            );
          } else {
            setActionError("Action failed.");
          }
          return;
        }
      } else if (action.type === "revoke-link") {
        await revokeParentLink(action.studentId, accessToken, refreshToken);
        setStudents((prev) =>
          prev.map((s) =>
            s.studentId === action.studentId
              ? { ...s, parentLinkSentAt: null }
              : s
          )
        );
      } else if (action.type === "delete") {
        await deleteStudent(action.studentId, accessToken, refreshToken);
        setStudents((prev) =>
          prev.filter((s) => s.studentId !== action.studentId)
        );
      } else if (action.type === "resend-code") {
        const student = students.find((s) => s.studentId === action.studentId);
        if (!student) return;

        const res = await resendCode(
          { id: action.studentId, role: "student", reset: student.status === "active" },
          accessToken,
          refreshToken
        );

        if (typeof res.code === "string") {
          const code = res.code;

          setCreatedMap((prev) => ({
            ...prev,
            [action.studentId]: {
              fullName: student.fullName,
              email: student.email,
              code: code,
            },
          }));
        }
      }
    } catch {
      setActionError("Action failed.");
    } finally {
      setInFlight(null);
    }
  }

  return (
    <PageShell
      title="Students"
      description={`${students.length} registered`}
    >
      {isLoading ? (
        <ListSkeleton rows={6} />
      ) : error ? (
        <div>{error}</div>
      ) : (
        <motion.div 
          className="flex flex-col gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Filter bar */}
          <motion.div 
            className="flex gap-2 flex-wrap bg-[var(--color-purple-light)] p-6 rounded-b-lg"
            initial={{ opacity: 0, y: 8, }}
            animate={{ opacity: 1, y: 0, }}
            transition={{ duration: 0.3, }}
          >
            <input
              type="text"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 min-w-0 h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            >
              <option value="">All classes</option>
              {CLASS_LEVELS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-purple)]"
            >
              <option value="">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </motion.div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setExpandedGroups(allExpanded)
              }
            >
              Expand All
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setExpandedGroups(allCollpsed)}
              >
                Collapse All
              </Button>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            {filtered.length} of {students.length} student
            {students.length !== 1 ? "s" : ""}
          </p>

          {actionError && (
            <p className="text-sm text-red-600">{actionError}</p>
          )}

          {CLASS_LEVELS.map(level => {
            const students = groupedStudents[level];

            if (students.length === 0) {
              return null;
            }

            return (
              <ClassGroup
                key={level}
                level={level}
                students={students}
                expanded={expandedGroups[level]}
                onToggle={() => 
                  setExpandedGroups(previous => ({
                    ...previous,
                    [level]: !previous[level], 
                  }))
                }
              >
                {students.map(student => (
                  <StudentRow
                    key={student.studentId}
                    student={student}
                    inFlight={inFlight}
                    onAction={handleAction}
                    canUseParentLink={canUseParentLink}
                    created={createdMap[student.studentId]}
                    expanded={expandedStudentId === student.studentId}
                    onToggle={() =>
                      setExpandedStudentId(previous => 
                        previous === student.studentId ? null : student.studentId)
                    }
                  />
                ))}
              </ClassGroup>
            )
          })}

          {filtered.length === 0 && !isLoading && (
            <EmptyState
              icon={<Users size={28} />}
              title="No students found"
              description="Try changing your filters or register a new student"
            
            />
          )}
        </motion.div>
      )}
    </PageShell>
  );
}