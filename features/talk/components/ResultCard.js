// 결과 카드 컴포넌트
// 공통 카드 UI (제목 / 본문 / 액션 슬롯)

import styles from './ResultCard.module.css'

export default function ResultCard({
  title,
  children,
  variant = 'default',
  actionSlot
}) {
  const cardClass = variant === 'highlight' 
    ? `${styles.card} ${styles.highlight}` 
    : styles.card

  return (
    <div className={cardClass}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {actionSlot && <div className={styles.actionSlot}>{actionSlot}</div>}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
