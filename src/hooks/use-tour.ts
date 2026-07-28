import { useCallback, useEffect, useRef } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import type { UserRole } from '@/lib/utils/roles'
import { studentTourSteps } from '@/lib/onboarding/tours/student'
import { schoolAdminTourSteps } from '@/lib/onboarding/tours/school-admin'
import { hammetAdminTourSteps } from '@/lib/onboarding/tours/hammet-admin'

const STEPS_BY_ROLE: Record<UserRole, typeof studentTourSteps> = {
  student:       studentTourSteps,
  school_admin:  schoolAdminTourSteps,
  hammet_admin:  hammetAdminTourSteps,
}

interface UseTourOptions {
  role: UserRole
  onComplete: () => void
}

export function useTour({ role, onComplete }: UseTourOptions) {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null)

  useEffect(() => {
    const handleResize = () => {
      driverRef.current?.refresh();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Instantiate once per role mount
    driverRef.current = driver({
      animate: true,
      smoothScroll: true,
      showProgress: true,
      progressText: '{{current}} of {{total}}',
      nextBtnText: 'Next →',
      prevBtnText: '← Back',
      doneBtnText: 'Done',
      overlayColor: '#1a0533',
      overlayOpacity: 0.4,
      popoverClass: 'hammet-tour-popover',
      onDestroyStarted: () => {
        onComplete()
        driverRef.current?.destroy()
      },
      steps: STEPS_BY_ROLE[role],
    })

    return () => {
      driverRef.current?.destroy()
    }
  }, [role, onComplete])

  const startTour = useCallback(() => {
    driverRef.current?.drive()
  }, [])

  return { startTour }
}