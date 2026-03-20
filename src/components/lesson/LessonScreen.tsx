import styles from './LessonScreen.module.css'
import { MODULES } from '@/lib/demoData'

export default function LessonScreen() {
  return (
    <div className={styles.layout}>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={`card card-sm ${styles.progressCard}`}>
          <p className="section-label">Term 1 · SS1A</p>
          <div className="prog-track">
            <div className="prog-fill" style={{ width: '25%' }} />
          </div>
          <div className={styles.progressMeta}>
            <span>3 of 12 weeks done</span>
            <span className={styles.progressPct}>25%</span>
          </div>
        </div>

        <div className="card card-sm">
          <p className="section-label">Week 1 · Modules</p>
          <ul className={styles.moduleList}>
            {MODULES.map((m) => (
              <li key={m.id} className={`${styles.moduleItem} ${styles[m.status]}`}>
                <div className={`${styles.modNum} ${styles[`modNum_${m.status}`]}`}>
                  {m.status === 'done' ? '✓' : m.id}
                </div>
                <div>
                  <p className={styles.modTitle}>{m.title}</p>
                  <p className={styles.modMeta}>{m.meta}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main lesson */}
      <main>
        <div className={styles.lessonCard}>

          <div className={styles.lessonHeader}>
            <div className={styles.headerBadges}>
              <span className={styles.badgeGlass}>Week 1 · Session 3</span>
              <span className={styles.badgeCyan}>Perplexity AI</span>
            </div>
            <h2>Your First AI Research Task</h2>
            <p>Use an AI research tool to find, evaluate, and summarise real information on a topic of global relevance.</p>
          </div>

          <div className={styles.lessonBody}>
            <p className={styles.bodyText}>
              Today you will use <strong>Perplexity AI</strong> — a tool that searches the internet and summarises what it finds — to research a real topic and write your own summary. This is your first step toward building a portfolio of work that shows what you can do with AI tools.
            </p>

            <div className={styles.toolBlock}>
              <div className={styles.toolIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--purple-dark)">
                  <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </div>
              <div>
                <p className={styles.toolName}>Open Perplexity AI</p>
                <span className={styles.toolMeta}>perplexity.ai · Search + summarise</span>
              </div>
              <a href="https://perplexity.ai" target="_blank" rel="noopener noreferrer" className="btn btn-cyan btn-sm" style={{ marginLeft: 'auto' }}>
                Open tool →
              </a>
            </div>

            <div className={styles.activityBlock}>
              <p className={styles.actLabel}>Your activity</p>
              <p>Research this topic using Perplexity: <em>How is AI being used in education in Africa?</em><br />Ask at least two follow-up questions. Take notes as you go.</p>
            </div>

            <div className={styles.reflectionBlock}>
              <label>
                Your reflection <span className={styles.reflectionHint}>(150–200 words)</span>
              </label>
              <textarea
                placeholder="Write a summary of what you found. Include: two ways AI is used in African education, one challenge you discovered, and your opinion on whether Nigerian schools should adopt AI tools…"
              />
            </div>
          </div>

          <div className={styles.lessonFooter}>
            <div className={styles.offlinePill}>
              <div className={styles.dotGreen} />
              Saved offline · syncs automatically
            </div>
            <div className={styles.footerActions}>
              <button className="btn btn-ghost btn-sm">← Previous</button>
              <button className="btn btn-primary">Submit &amp; continue →</button>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
