"use client";

import { useState, useEffect } from "react";
import { UserRole } from "@/types/api";

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    function handleOnline() { setIsOnline(true); }
    function handleOffline() { setIsOnline(false); }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
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