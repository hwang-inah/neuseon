// 대시보드

'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/shared/contexts/AuthContext'
import { useSalesData } from '@/features/sales-manager/hooks/useSalesData'
import { useDashboard } from '@/features/sales-manager/hooks/useDashboard'
import { DEMO_SALES_DATA } from '@/features/sales-manager/constants/demoData'
import SummaryCards from '@/features/sales-manager/components/SummaryCards'
import PeriodSelector from '@/features/sales-manager/components/PeriodSelector'
import TrendChart from '@/features/sales-manager/components/TrendChart'
import CompareChart from '@/features/sales-manager/components/CompareChart'
import InsightCard from '@/features/sales-manager/components/InsightCard'
import styles from './page.module.css'

export default function SalesManagerDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { sales, loading: salesLoading } = useSalesData()
  
  // 데모 모드: 인증되지 않았거나 로딩 중이면 데모 데이터 사용
  const isDemo = !isAuthenticated
  const displayData = useMemo(() => isDemo ? DEMO_SALES_DATA : sales, [isDemo, sales])
  const { period, setPeriod, periodLabel, summary, chartData, compareData, insights } = useDashboard(displayData)

  // 인증 체크 중이거나 (로그인 상태 + 데이터 로딩 중)
  if (authLoading || (salesLoading && !isDemo)) {
    return <div className={styles.container}>로딩 중...</div>
  }

  return (
    <div className={styles.container}>
      {/* 데모 배너 */}
      {isDemo && (
        <div className={styles.demoBanner}>
          <span>🎯 데모 버전입니다. 실제 데이터를 관리하려면</span>
          <Link 
            href={`/auth/login?redirectTo=${encodeURIComponent('/sales-manager')}`} 
            className={styles.demoLoginButton}
          >
            로그인하기
          </Link>
        </div>
      )}

      {/* 헤더 */}
      <div className={styles.header}>
        <h1 className={styles.title}>매출관리</h1>

        {/* 인사이트 카드 */}
        <InsightCard insights={insights} isLocked={false} />
        
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

      {/* 입력 버튼 */}
      {!isDemo && (
        <Link href="/sales-manager/input" className={styles.addButton}>
          +
        </Link>
      )}
    </div>
  )
}