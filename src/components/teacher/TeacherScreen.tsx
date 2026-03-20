import styles from './TeacherScreen.module.css'
import { STUDENTS, SUBMISSIONS } from '@/lib/demoData'

const statusBadge: Record<string, string> = {
  'on-track': 'badge-green',
  'behind':   'badge-warn',
  'at-risk':  'badge-red',
}
const statusLabel: Record<string, string> = {
  'on-track': 'On track',
  'behind':   'Behind',
  'at-risk':  'At risk',
}

export default function TeacherScreen() {
  return (
    <div className={styles.wrapper}>

      <div className={styles.pageHeader}>
        <div className={styles.breadcrumb}>Dashboard <span>›</span> SS1A</div>
        <h1>SS1A — Term 1 Overview</h1>
        <p>Kings College Demo School · Mr. Babatunde Afolabi</p>
      </div>

      {/* Stats */}
      <div className={styles.statRow}>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Students enrolled</div>
          <div className={styles.statVal}>28</div>
          <div className={styles.statSub}>of 30 seats used</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Avg. progress</div>
          <div className={`${styles.statVal} ${styles.valCyan}`}>31%</div>
          <div className={styles.statSub}>3.7 modules avg</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Pending review</div>
          <div className={`${styles.statVal} ${styles.valPurple}`}>6</div>
          <div className={styles.statSub}>submissions awaiting</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statLabel}>Last sync</div>
          <div className={`${styles.statVal} ${styles.valSm}`}>Today 9:41am</div>
          <div className={styles.statSub}>All devices synced</div>
        </div>
      </div>

      <div className={styles.layout}>

        {/* Student progress table */}
        <div className="card">
          <p className="section-label">Student progress</p>
          {STUDENTS.map((s) => (
            <div key={s.name} className={styles.studentRow}>
              <div className={styles.studentAv}>{s.initials}</div>
              <div className={styles.studentName}>{s.name}</div>
              <div className={styles.studentProg}>
                <div className="prog-track">
                  <div className="prog-fill" style={{ width: `${s.progress}%` }} />
                </div>
              </div>
              <div className={styles.studentNum}>{s.modules} / {s.total}</div>
              <span className={`badge ${statusBadge[s.status]}`}>{statusLabel[s.status]}</span>
            </div>
          ))}
          <p className={styles.moreStudents}>+ 22 more students</p>
        </div>

        {/* Right column */}
        <div>
          <div className={`card ${styles.submissionsCard}`}>
            <p className="section-label">Pending submissions</p>
            {SUBMISSIONS.map((sub) => (
              <div key={sub.name + sub.module} className={styles.subItem}>
                <div className={`${styles.subDot} ${sub.status === 'approved' ? styles.subDotApproved : ''}`} />
                <div>
                  <p className={styles.subName}>{sub.name}</p>
                  <p className={styles.subModule}>{sub.module}</p>
                </div>
                <span className={styles.subTime}>{sub.time}</span>
              </div>
            ))}
            <button className="btn btn-primary btn-sm" style={{ width: '100%', marginTop: 12 }}>
              Review all submissions →
            </button>
          </div>

          <div className="card">
            <p className="section-label">Offline status</p>
            <div className={styles.offlineRow}>
              <div className={styles.dotGreen} />
              <span>28 / 28 devices synced</span>
            </div>
            <p className={styles.offlineMeta}>
              All student work saved locally. Sync happens automatically when devices reconnect.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
