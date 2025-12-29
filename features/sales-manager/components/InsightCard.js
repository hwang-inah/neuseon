// 인사이트 카드 컴포넌트 (유료 기능 미리보기)

import styles from './InsightCard.module.css'

export default function InsightCard({ insights, isLocked = true }) {
  if (!insights || insights.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>💡 인사이트</h2>
      
      <div className={styles.wrapper}>
        {/* 인사이트 목록 */}
        <div className={isLocked ? styles.blurred : ''}>
          <div className={styles.insightList}>
            {insights.map((insight, index) => (
              <div key={index} className={styles.insightItem}>
                <span className={styles.icon}>{insight.icon}</span>
                <span className={styles.text}>{insight.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 락 화면 */}
        {isLocked && (
          <div className={styles.lockOverlay}>
            <div className={styles.lockContent}>
              <div className={styles.lockIcon}>🔒</div>
              <h3 className={styles.lockTitle}>맞춤 인사이트는 구독에서 제공됩니다</h3>
              <p className={styles.lockDescription}>
                AI가 분석한 매출/지출 패턴과<br />
                개선 포인트를 확인하세요
              </p>
              <button className={styles.subscribeButton}>
                구독하고 확인하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}