// 대시보드

'use client'

import Link from 'next/link'
import { useSalesData } from '@/features/sales-manager/hooks/useSalesData'
import { formatCurrency } from '@/shared/utils/formatUtils'
import { calculateSum, calculateProfit } from '@/features/sales-manager/utils/calculateUtils'
import { PAYMENT_METHOD_LABELS, TYPE_LABELS } from '@/constants/common'
import styles from './page.module.css'

export default function SalesManagerDashboard() {
  const { sales, loading } = useSalesData()

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>
  }

  const totalIncome = calculateSum(sales, 'income')
  const totalExpense = calculateSum(sales, 'expense')
  const profit = calculateProfit(sales)

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>매출관리</h1>
        <p className={styles.period}>이번 달</p>
      </div>

      {/* 요약 카드 */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>매출</div>
          <div className={styles.summaryAmount}>{formatCurrency(totalIncome)}</div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>지출</div>
          <div className={styles.summaryAmount}>{formatCurrency(totalExpense)}</div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>순익</div>
          <div className={`${styles.summaryAmount} ${profit >= 0 ? styles.profit : styles.loss}`}>
            {formatCurrency(profit)}
          </div>
        </div>
      </div>

      {/* 최근 내역 */}
      <div className={styles.recentSection}>
        <h2 className={styles.recentTitle}>최근 내역</h2>

        {sales.length === 0 ? (
          <p className={styles.emptyMessage}>데이터가 없습니다</p>
        ) : (
          <div>
            {sales.slice(0, 10).map(sale => (
              <div key={sale.id} className={styles.listItem}>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTitle}>
                    {TYPE_LABELS[sale.type]} · {PAYMENT_METHOD_LABELS[sale.payment_method]}
                  </div>
                  <div className={styles.itemDetail}>
                    {sale.date} {sale.memo && `· ${sale.memo}`}
                  </div>
                </div>
                <div className={`${styles.itemAmount} ${sale.type === 'income' ? styles.income : styles.expense}`}>
                  {sale.type === 'income' ? '+' : '-'}{formatCurrency(sale.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 입력 버튼 */}
      <Link href="/sales-manager/input" className={styles.addButton}>
        +
      </Link>
    </div>
  )
}