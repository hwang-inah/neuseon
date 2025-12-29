// 대시보드

'use client'

import Link from 'next/link'
import { useSalesData } from '@/features/sales-manager/hooks/useSalesData'
import { useDashboard } from '@/features/sales-manager/hooks/useDashboard'
import SummaryCards from '@/features/sales-manager/components/SummaryCards'
import PeriodSelector from '@/features/sales-manager/components/PeriodSelector'
import TrendChart from '@/features/sales-manager/components/TrendChart'
import CompareChart from '@/features/sales-manager/components/CompareChart'
import InsightCard from '@/features/sales-manager/components/InsightCard'
import styles from './page.module.css'

export default function SalesManagerDashboard() {
  const { sales, loading } = useSalesData()
  const { period, setPeriod, periodLabel, summary, chartData, compareData, insights } = useDashboard(sales)

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>
  }

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>매출관리</h1>
        <p className={styles.period}>{periodLabel}</p>
      </div>

      {/* 기간 선택 */}
      <PeriodSelector period={period} onChange={setPeriod} />

      {/* 요약 카드 */}
      <SummaryCards summary={summary} />

      {/* 추이 그래프 */}
      <TrendChart data={chartData} period={period} />

      {/* 비교 그래프 (유료 미리보기) */}
      <CompareChart data={compareData} isLocked={false} /> {/* 개발 중: false, 배포 시: true */}

      {/* 인사이트 카드 (유료 미리보기) */}
      <InsightCard insights={insights} isLocked={false} /> {/* 개발 중: false, 배포 시: true */}

      {/* 입력 버튼 */}
      <Link href="/sales-manager/input" className={styles.addButton}>
        +
      </Link>
    </div>
  )
}