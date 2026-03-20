'use client'

import { useEffect } from 'react'

export function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('SW registered'))
        .catch(console.error)
    }
  }, [])

  return null
}