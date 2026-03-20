import styles from './PortfolioScreen.module.css'
import { PORTFOLIO_ENTRIES } from '@/lib/demoData'

const SKILLS = ['Prompt engineering', 'AI research', 'Summarisation', 'Information evaluation', 'Digital tools']

export default function PortfolioScreen() {
  return (
    <div className={styles.wrapper}>

      {/* Student header */}
      <div className={styles.profileCard}>
        <div className={styles.avatar}>AO</div>
        <div className={styles.profileInfo}>
          <h1>Adaeze Okonkwo</h1>
          <p>SS1A · Kings College Demo School · Term 1, 2026</p>
          <div className={styles.skillsRow}>
            {SKILLS.map((s) => <span key={s} className={styles.skillChip}>{s}</span>)}
          </div>
        </div>
        <div className={styles.profileStat}>
          <div className={styles.statNum}>3</div>
          <div className={styles.statLabel}>modules complete</div>
          <button className={styles.shareBtn}>Share portfolio ↗</button>
        </div>
      </div>

      {/* Portfolio grid */}
      <div className={styles.grid}>
        {PORTFOLIO_ENTRIES.map((entry) => (
          <div key={entry.title} className={styles.entryCard}>
            <div className={styles.entryTop}>
              <h3>{entry.title}</h3>
              <span>{entry.meta}</span>
            </div>
            <div className={styles.entryBody}>
              <p className={styles.reflection}>{entry.reflection}</p>
              <div className={styles.entrySkills}>
                {entry.skills.map((s) => <span key={s} className={styles.entrySkill}>{s}</span>)}
              </div>
            </div>
          </div>
        ))}

        {/* Empty next slot */}
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>+</div>
          <p className={styles.emptyTitle}>Next entry unlocked</p>
          <p className={styles.emptyMeta}>Complete Session 3 to add your research task</p>
        </div>
      </div>

    </div>
  )
}
