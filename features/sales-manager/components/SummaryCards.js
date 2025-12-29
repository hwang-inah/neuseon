// 대시보드 요약 카드 컴포넌트

import { formatCurrency } from '@/shared/utils/formatUtils'
import styles from './SummaryCards.module.css'

export default function SummaryCards({ summary }) {
  const { income, expense, profit, profitRate } = summary

  return (
    <div className={styles.grid}>
      {/* 총 매출 */}
      <div className={styles.card}>
        <div className={styles.label}>총 매출</div>
        <div className={styles.amount}>{formatCurrency(income)}</div>
      </div>

      {/* 총 지출 */}
      <div className={styles.card}>
        <div className={styles.label}>총 지출</div>
        <div className={styles.amount}>{formatCurrency(expense)}</div>
      </div>

      {/* 순익 */}
      <div className={styles.card}>
        <div className={styles.label}>순익</div>
        <div className={`${styles.amount} ${profit >= 0 ? styles.profit : styles.loss}`}>
          {formatCurrency(profit)}
        </div>
      </div>

      {/* 순익률 */}
      <div className={styles.card}>
        <div className={styles.label}>순익률</div>
        <div className={`${styles.amount} ${profitRate >= 0 ? styles.profit : styles.loss}`}>
          {profitRate.toFixed(1)}%
        </div>
      </div>
    </div>
  )
}