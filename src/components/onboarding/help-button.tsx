'use client'

import { CircleHelp } from 'lucide-react'
import { useOnboardingContext } from '@/components/onboarding/onboarding-provider'

export function HelpButton() {
  const { startTour } = useOnboardingContext()

  return (
    <button
      onClick={startTour}
      aria-label="Help — take the tour"
      className="fixed bottom-6 right-6 z-40 flex items-center justify-center
        w-11 h-11 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg 
        shadow-cyan-900/40 transition-all duration-200 hover:scale-110 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
      "
    >
      <CircleHelp className="w-5 h-5" strokeWidth={2} />
    </button>
  )
}