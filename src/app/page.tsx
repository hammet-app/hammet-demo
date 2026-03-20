'use client'

import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import LessonScreen from '@/components/lesson/LessonScreen'
import PortfolioScreen from '@/components/portfolio/PortfolioScreen'
import TeacherScreen from '@/components/teacher/TeacherScreen'
import AdminScreen from '@/components/admin/AdminScreen'
import { NAV_ITEMS } from '@/lib/demoData'
import type { DemoScreen } from '@/types'

export default function DemoPage() {
  const [activeScreen, setActiveScreen] = useState<DemoScreen>('lesson')

  const currentUser = NAV_ITEMS.find((n) => n.key === activeScreen)!.user

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Topbar
        activeScreen={activeScreen}
        currentUser={currentUser}
        onNavigate={setActiveScreen}
      />
      <main style={{ flex: 1 }}>
        {activeScreen === 'lesson'    && <LessonScreen />}
        {activeScreen === 'portfolio' && <PortfolioScreen />}
        {activeScreen === 'teacher'   && <TeacherScreen />}
        {activeScreen === 'admin'     && <AdminScreen />}
      </main>
    </div>
  )
}
