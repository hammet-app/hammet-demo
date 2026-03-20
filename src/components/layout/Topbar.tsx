'use client'

import styles from './Topbar.module.css'
import type { DemoScreen, DemoUser } from '@/types'
import { NAV_ITEMS } from '@/lib/demoData'

interface TopbarProps {
  activeScreen: DemoScreen
  currentUser: DemoUser
  onNavigate: (screen: DemoScreen) => void
}

const avatarClass: Record<string, string> = {
  student:      styles.avStudent,
  teacher:      styles.avTeacher,
  school_admin: styles.avAdmin,
}

export default function Topbar({ activeScreen, currentUser, onNavigate }: TopbarProps) {
  return (
    <header className={styles.topbar}>

      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 22 7 12 12 2 7" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <span className={styles.logoText}>
          HammetLabs <em>AI Studies</em>
        </span>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`${styles.navBtn} ${activeScreen === item.key ? styles.navBtnActive : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* User badge */}
      <div className={styles.userBadge}>
        <div className={`${styles.avatar} ${avatarClass[currentUser.role]}`}>
          {currentUser.initials}
        </div>
        <span className={styles.userName}>{currentUser.name}</span>
      </div>

    </header>
  )
}
