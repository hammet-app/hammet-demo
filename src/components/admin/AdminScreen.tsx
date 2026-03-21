import styles from './AdminScreen.module.css'
import { ENROLLED_STUDENTS } from '@/lib/demoData'

const CHECKLIST = [
  { done: true,  title: 'School account created',       detail: 'Kings College Demo School · Pilot tier' },
  { done: true,  title: 'Teacher assigned',             detail: 'Mr. Babatunde Afolabi · SS1A & SS1B' },
  { done: true,  title: '28 students enrolled',         detail: 'SS1A · Term 1 modules unlocked' },
  { done: false, title: 'PWA installed on student devices', detail: 'Visit hammet.hammetlabs.com on each device and tap "Add to Home Screen"' },
  { done: false, title: 'Run first lesson',             detail: 'Week 1 · Session 1 is ready. Teacher guide has been sent.' },
]

const moduleBadge = (n: number) => {
  if (n >= 3) return 'badge-green'
  if (n >= 2) return 'badge-warn'
  return 'badge-red'
}

export default function AdminScreen() {
  return (
    <div className={styles.wrapper}>

      <div className={styles.pageHeader}>
        <div className={styles.breadcrumb}>Admin <span>›</span> Enrolment</div>
        <h1>School Setup &amp; Enrolment</h1>
        <p>Kings College Demo School · Pilot term · Up to 30 students</p>
      </div>

      <div className={styles.topGrid}>

        {/* Enrolment form */}
        <div className="card">
          <p className="section-label">Enrol a new student</p>
          <div className={styles.formGrid}>
            <div className={styles.formRow}><label>First name</label><input type="text" placeholder="Adaeze" /></div>
            <div className={styles.formRow}><label>Last name</label><input type="text" placeholder="Okonkwo" /></div>
          </div>
          <div className={styles.formRow}>
            <label>Email address</label>
            <input type="email" placeholder="student@kingscollegelagos.edu.ng" />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <label>Class level</label>
              <select><option>SS1</option><option>SS2</option><option>SS3</option></select>
            </div>
            <div className={styles.formRow}>
              <label>Class arm</label>
              <select><option>A</option><option>B</option><option>C</option></select>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn btn-primary">Add student</button>
            <button className="btn btn-ghost">Bulk upload CSV</button>
          </div>
        </div>

        {/* Onboarding checklist */}
        <div className="card">
          <p className="section-label">Onboarding checklist</p>
          {CHECKLIST.map((step, i) => (
            <div key={step.title} className={styles.stepRow}>
              <div className={`${styles.stepNum} ${step.done ? styles.stepDone : ''}`}>
                {step.done ? '✓' : i + 1}
              </div>
              <div>
                <strong>{step.title}</strong>
                <p>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Students table */}
      <div className="card">
        <p className="section-label">Enrolled students — SS1A (28 of 30)</p>
        <table className="tbl">
          <thead>
            <tr>
              <th>Student</th><th>Email</th><th>Class</th>
              <th>Enrolled</th><th>Progress</th><th>Parent link</th>
            </tr>
          </thead>
          <tbody>
            {ENROLLED_STUDENTS.map((s) => (
              <tr key={s.email}>
                <td><strong>{s.name}</strong></td>
                <td>{s.email}</td>
                <td>{s.classArm}</td>
                <td>{s.enrolledDate}</td>
                <td><span className={`badge ${moduleBadge(s.modules)}`}>{s.modules} modules</span></td>
                <td>
                  <button className="btn btn-ghost btn-sm">
                    {s.parentLinkSent ? 'Sent ✓' : 'Send link'}
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td colSpan={6} className={styles.moreRow}>+ 23 more students</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  )
}
