export type UserRole = 'student' | 'teacher' | 'school_admin'

export interface DemoUser {
  initials: string
  name: string
  role: UserRole
}

export type DemoScreen = 'lesson' | 'portfolio' | 'teacher' | 'admin'

export interface NavItem {
  key: DemoScreen
  label: string
  user: DemoUser
}

export interface ModuleItem {
  id: number
  title: string
  meta: string
  status: 'done' | 'active' | 'locked'
}

export interface StudentRow {
  initials: string
  name: string
  progress: number   // 0–100
  modules: number
  total: number
  status: 'on-track' | 'behind' | 'at-risk'
}

export interface SubmissionItem {
  name: string
  module: string
  time: string
  status: 'pending' | 'approved'
}

export interface PortfolioEntry {
  title: string
  meta: string
  reflection: string
  skills: string[]
}

export interface EnrolledStudent {
  name: string
  email: string
  classArm: string
  enrolledDate: string
  modules: number
  parentLinkSent: boolean
}
