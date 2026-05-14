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
  const [activeRole, setActiveRole] = useState<UserRole>(roles[0]);

  useEffect(() => {
    const saved = localStorage.getItem("activeRole") as UserRole | null;

    if (saved && roles.includes(saved)) {
      setActiveRole(saved);
    }
  }, [roles]);

  useEffect(() => {
    localStorage.setItem("activeRole", activeRole);
  }, [activeRole]);

  return [activeRole, setActiveRole] as const;
}