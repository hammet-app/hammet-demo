"use client";

import { useState, useEffect, useRef } from "react";
import { 
  getPendingSubmissions, 
  getPendingProgress, 
  clearPendingProgress, 
  updateSubmissionFileUrls
} from "@/lib/db"
import { syncPendingSubmissions } from "@/lib/db"
import { studentApi } from "@/lib/api/student"
import { AuthUser, UserRole } from "@/lib/utils/roles";
import { uploadAllPendingFiles } from "@/lib/file-pipeline";

export function useOnlineStatus(
  user: AuthUser,
  accessToken: string | null,
  refreshToken: () => Promise<string | null>
): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  )
  const isSyncing = useRef(false)

  useEffect(() => {
    async function handleOnline() {
      setIsOnline(true)

      // Debounce — don't double-fire if the event fires twice
      if (isSyncing.current) return
      isSyncing.current = true

      try {
        const token = accessToken ?? await refreshToken()
        if (!token) return

        // 1. Upload pending files to get their paths
        const uploaded = await uploadAllPendingFiles(token)
        if (uploaded.length > 0) {
          // Group paths by moduleId
          const pathsByModule = new Map<string, string[]>()
          for (const u of uploaded) {
            const paths = pathsByModule.get(u.moduleId) ?? []
            paths.push(u.path)
            pathsByModule.set(u.moduleId, paths)
          }

          // Patch each affected submission in Dexie before sync
          for (const [moduleId, paths] of pathsByModule) {
            await updateSubmissionFileUrls(moduleId, user.id, paths)
          }
        }
        

        // 2. Sync pending submissions first
        await syncPendingSubmissions(user.id, token)

        // 3. Sync pending progress — but only for modules with no pending submission
        // (if submission was just synced, markSubmissionSynced already cleared progress)
        const pendingProgress = await getPendingProgress(user.id)
        if (pendingProgress.length === 0) return

        const pendingSubmissions = await getPendingSubmissions(user.id)
        const modulesWithPendingSubmission = new Set(
          pendingSubmissions.map((s) => s.moduleId)
        )

        await Promise.allSettled(
          pendingProgress
            .filter((p) => !modulesWithPendingSubmission.has(p.moduleId))
            .map(async (p) => {
              try {
                await studentApi.saveProgress({studentId: user.id, moduleId: p.moduleId, sectionId:p.sectionId}, token, refreshToken)
                await clearPendingProgress(user.id)
              } catch {
                // Will retry next reconnect
              }
            })
        )
      } finally {
        isSyncing.current = false
      }
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [accessToken, refreshToken])

  return isOnline
}


export function usePersistedRole(roles: UserRole[]) {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("activeRole") as UserRole | null;

      if (saved && roles.includes(saved)) {
        return saved;
      }
    }

    return roles[0];
  });

  useEffect(() => {
    // Handle cases where saved role no longer exists
    if (!roles.includes(activeRole)) {
      setActiveRole(roles[0]);
    }
  }, [roles, activeRole]);

  useEffect(() => {
    localStorage.setItem("activeRole", activeRole);
  }, [activeRole]);

  return [activeRole, setActiveRole] as const;

}