'use client'

// lib/hooks/useOnlineStatus.ts
// Simple hook that returns true/false for network connectivity.
// Use this in any component that needs to show offline state.
//
// Usage:
//   const isOnline = useOnlineStatus()
//   if (!isOnline) show offline indicator

import { useEffect, useState } from 'react'

export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const goOnline  = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)

    window.addEventListener('online',  goOnline)
    window.addEventListener('offline', goOffline)

    return () => {
      window.removeEventListener('online',  goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  return isOnline
}
