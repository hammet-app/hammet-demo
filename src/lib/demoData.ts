import type {
  NavItem, ModuleItem, StudentRow,
  SubmissionItem, PortfolioEntry, EnrolledStudent,
} from '@/types'

export const NAV_ITEMS: NavItem[] = [
  { key: 'lesson',    label: 'Lesson View',        user: { initials: 'AO', name: 'Adaeze Okonkwo · SS1A', role: 'student' } },
  { key: 'portfolio', label: 'Student Portfolio',  user: { initials: 'AO', name: 'Adaeze Okonkwo · SS1A', role: 'student' } },
  { key: 'teacher',   label: 'Teacher Dashboard',  user: { initials: 'BA', name: 'Mr. Afolabi · Teacher',  role: 'teacher' } },
  { key: 'admin',     label: 'School Admin',        user: { initials: 'KA', name: 'Mrs. Kadiri · Admin',    role: 'school_admin' } },
]

export const MODULES: ModuleItem[] = [
  { id: 1, title: 'What Is AI?',               meta: 'Completed · Wk 1 S1',       status: 'done' },
  { id: 2, title: 'Inputs & Outputs',           meta: 'Completed · Wk 1 S2',       status: 'done' },
  { id: 3, title: 'Your First AI Research Task',meta: 'In progress · Wk 1 S3',     status: 'active' },
  { id: 4, title: 'Writing Better Prompts',     meta: 'Wk 2 S1 · Locked',          status: 'locked' },
  { id: 5, title: 'Summarisation with AI',      meta: 'Wk 2 S2 · Locked',          status: 'locked' },
]

export const STUDENTS: StudentRow[] = [
  { initials: 'AO', name: 'Adaeze Okonkwo',  progress: 25, modules: 3, total: 12, status: 'on-track' },
  { initials: 'EM', name: 'Emeka Mbah',       progress: 25, modules: 3, total: 12, status: 'on-track' },
  { initials: 'FO', name: 'Fatima Ogundele',  progress: 17, modules: 2, total: 12, status: 'behind'   },
  { initials: 'CI', name: 'Chidi Ike',        progress: 33, modules: 4, total: 12, status: 'on-track' },
  { initials: 'TN', name: 'Temi Nwachukwu',   progress: 8,  modules: 1, total: 12, status: 'at-risk'  },
  { initials: 'BL', name: 'Blessing Lawal',   progress: 25, modules: 3, total: 12, status: 'on-track' },
]

export const SUBMISSIONS: SubmissionItem[] = [
  { name: 'Fatima Ogundele', module: 'Inputs & Outputs · Wk 1 S2',     time: '2h ago',   status: 'pending'  },
  { name: 'Temi Nwachukwu',  module: 'What Is AI? · Wk 1 S1',          time: '3h ago',   status: 'pending'  },
  { name: 'Chidi Ike',       module: 'First Research Task · Wk 1 S3',  time: 'Yesterday',status: 'approved' },
]

export const PORTFOLIO_ENTRIES: PortfolioEntry[] = [
  {
    title: 'What Is Artificial Intelligence?',
    meta:  'Week 1 · Session 1 · Mar 18, 2026',
    reflection: '"AI is software that learns from data and makes decisions. I use it every day without knowing — Google Maps, YouTube recommendations, and even autocorrect are all AI. I think AI could help Nigerian students by giving us personalised study materials."',
    skills: ['AI concepts', 'Critical thinking'],
  },
  {
    title: 'Inputs & Outputs: Writing Better Prompts',
    meta:  'Week 1 · Session 2 · Mar 18, 2026',
    reflection: '"The second prompt was much better because it told the AI exactly what I wanted — a specific country, topic, and length. Vague questions give vague answers. I will use this in all my future AI work."',
    skills: ['Prompt engineering', 'Evaluation'],
  },
]

export const ENROLLED_STUDENTS: EnrolledStudent[] = [
  { name: 'Adaeze Okonkwo', email: 'a.okonkwo@kcd.edu.ng', classArm: 'SS1A', enrolledDate: 'Mar 17', modules: 3,  parentLinkSent: false },
  { name: 'Emeka Mbah',     email: 'e.mbah@kcd.edu.ng',    classArm: 'SS1A', enrolledDate: 'Mar 17', modules: 3,  parentLinkSent: false },
  { name: 'Fatima Ogundele',email: 'f.ogundele@kcd.edu.ng', classArm: 'SS1A', enrolledDate: 'Mar 17', modules: 2, parentLinkSent: false },
  { name: 'Temi Nwachukwu', email: 't.nwachukwu@kcd.edu.ng',classArm: 'SS1A', enrolledDate: 'Mar 18', modules: 1, parentLinkSent: false },
  { name: 'Chidi Ike',      email: 'c.ike@kcd.edu.ng',     classArm: 'SS1A', enrolledDate: 'Mar 17', modules: 4,  parentLinkSent: true  },
]
