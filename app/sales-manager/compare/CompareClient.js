// 비교분석 페이지 - Client Component

'use client'

import { useMemo } from 'react'
import { useSalesData } from '@/features/sales-manager/hooks/useSalesData'
import { useCompare } from '@/features/sales-manager/hooks/useCompare'
import CompareBarChart from '@/features/sales-manager/components/CompareBarChart'
import CompareTable from '@/features/sales-manager/components/CompareTable'
import { formatCurrency } from '@/shared/utils/formatUtils'
import styles from './page.module.css'

export default function CompareClient() {
  const { sales, loading } = useSalesData()
  const {
    periodType,
    setPeriodType,
    period1,
    setPeriod1,
    period2,
    setPeriod2,
    availablePeriods,
    comparisonResult,
    formatPeriodLabel,
    filteredData1,
    filteredData2
  } = useCompare(sales)

  // 기간 레이블 계산 (항상 호출되어야 하는 Hook)
  const period1Label = useMemo(() => {
    return period1 ? formatPeriodLabel(period1) : ''
  }, [period1, formatPeriodLabel])

  const period2Label = useMemo(() => {
    return period2 ? formatPeriodLabel(period2) : ''
  }, [period2, formatPeriodLabel])

  // 동적 인사이트 생성 (메모이제이션으로 불필요한 재생성 방지)
  // loading 상태와 데이터 미존재 상태를 내부에서 가드 처리
  const insight = useMemo(() => {
    // 로딩 중이거나 데이터가 없으면 기본 메시지 반환
    if (loading) {
      return '로딩 중...'
    }

    if (!comparisonResult || !period1 || !period2) {
      return '기간을 선택하여 비교 분석을 시작하세요.'
    }

    // period2Label은 useMemo 내부에서 계산 (dependency에 파생 값 포함 방지)
    const period2LabelValue = period2 ? formatPeriodLabel(period2) : ''

    const { growth } = comparisonResult
    const insights = []

    // 매출 인사이트
    if (growth.income > 0) {
      insights.push(`${period2LabelValue} 대비 매출이 ${growth.income}% 증가했습니다!`)
    } else if (growth.income < 0) {
      insights.push(`${period2LabelValue} 대비 매출이 ${Math.abs(growth.income)}% 감소했습니다`)
    } else {
      insights.push(`매출이 이전 기간과 동일합니다`)
    }

    // 지출 인사이트
    if (growth.expense > 0) {
      insights.push(`지출은 ${growth.expense}% 증가했습니다`)
    } else if (growth.expense < 0) {
      insights.push(`지출은 ${Math.abs(growth.expense)}% 감소했습니다!`)
    }

    return insights.join(', ')
  }, [loading, comparisonResult, period1, period2, formatPeriodLabel])

  // 조건부 return은 모든 Hook 호출 이후에 위치
  if (loading) {
    return <div className={styles.container}>로딩 중...</div>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>비교분석</h1>
      
      {/* 동적 인사이트 */}
      <div className={styles.insight}>
        <p className={styles.insightIcon}>💡</p>
        <p className={styles.insightText}>{insight}</p>
      </div>

      {/* 기간 선택 */}
      <div className={styles.selectorSection}>
        {/* 기간 타입 */}
        <div className={styles.periodButtons}>
          <button
            className={`${styles.periodButton} ${periodType === 'month' ? styles.active : ''}`}
            onClick={() => setPeriodType('month')}
          >
            월별
          </button>
          <button
            className={`${styles.periodButton} ${periodType === 'year' ? styles.active : ''}`}
            onClick={() => setPeriodType('year')}
          >
            년도별
          </button>
        </div>

        {/* 비교 대상 선택 */}
        <div className={styles.compareSelector}>
          <div className={styles.selectGroup}>
            <label htmlFor="compare-period1" className={styles.label}>기준 기간</label>
            <select
              id="compare-period1"
              name="period1"
              className={styles.select}
              value={period1}
              onChange={(e) => setPeriod1(e.target.value)}
            >
              <option value="">선택</option>
              {availablePeriods.map(period => (
                <option key={period} value={period}>
                  {formatPeriodLabel(period)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectGroup}>
            <label htmlFor="compare-period2" className={styles.label}>비교 기간</label>
            <select
              id="compare-period2"
              name="period2"
              className={styles.select}
              value={period2}
              onChange={(e) => setPeriod2(e.target.value)}
            >
              <option value="">선택</option>
              {availablePeriods.map(period => (
                <option key={period} value={period}>
                  {formatPeriodLabel(period)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 비교 결과 */}
      {comparisonResult ? (
        <>
          {/* 요약 카드 */}
          <div className={styles.summarySection}>
            <h2 className={styles.sectionTitle}>
              {period1Label} vs {period2Label}
            </h2>

            <div className={styles.summaryGrid}>
              {/* 매출 */}
              <div className={styles.summaryCard}>
                <div className={styles.cardTitle}>매출</div>
                <div className={styles.cardValues}>
                  <span className={styles.cardLabel}>{period1Label}</span>
                  <span className={styles.cardAmount}>{formatCurrency(comparisonResult.period1.income)}</span>
                </div>
                <div className={styles.cardValues}>
                  <span className={styles.cardLabel}>{period2Label}</span>
                  <span className={styles.cardAmount}>{formatCurrency(comparisonResult.period2.income)}</span>
                </div>
                <div className={`${styles.cardGrowth} ${
                  comparisonResult.growth.income > 0 ? styles.positive : 
                  comparisonResult.growth.income < 0 ? styles.negative : styles.neutral
                }`}>
                  {comparisonResult.growth.income > 0 ? '+' : ''}{comparisonResult.growth.income}%
                </div>
              </div>

              {/* 지출 */}
              <div className={styles.summaryCard}>
                <div className={styles.cardTitle}>지출</div>
                <div className={styles.cardValues}>
                  <span className={styles.cardLabel}>{period1Label}</span>
                  <span className={styles.cardAmount}>{formatCurrency(comparisonResult.period1.expense)}</span>
                </div>
                <div className={styles.cardValues}>
                  <span className={styles.cardLabel}>{period2Label}</span>
                  <span className={styles.cardAmount}>{formatCurrency(comparisonResult.period2.expense)}</span>
                </div>
                <div className={`${styles.cardGrowth} ${
                  comparisonResult.growth.expense > 0 ? styles.negative : 
                  comparisonResult.growth.expense < 0 ? styles.positive : styles.neutral
                }`}>
                  {comparisonResult.growth.expense > 0 ? '+' : ''}{comparisonResult.growth.expense}%
                </div>
              </div>

              {/* 순익 */}
              <div className={styles.summaryCard}>
                <div className={styles.cardTitle}>순익</div>
                <div className={styles.cardValues}>
                  <span className={styles.cardLabel}>{period1Label}</span>
                  <span className={styles.cardAmount}>{formatCurrency(comparisonResult.period1.profit)}</span>
                </div>
                <div className={styles.cardValues}>
                  <span className={styles.cardLabel}>{period2Label}</span>
                  <span className={styles.cardAmount}>{formatCurrency(comparisonResult.period2.profit)}</span>
                </div>
                <div className={`${styles.cardGrowth} ${
                  comparisonResult.growth.profit > 0 ? styles.positive : 
                  comparisonResult.growth.profit < 0 ? styles.negative : styles.neutral
                }`}>
                  {comparisonResult.growth.profit > 0 ? '+' : ''}{comparisonResult.growth.profit}%
                </div>
              </div>
            </div>
          </div>

          {/* 차트 */}
          <CompareBarChart
            comparisonResult={comparisonResult}
            period1Label={period1Label}
            period2Label={period2Label}
          />

          {/* 컬럼별 비교표 (지출만) */}
          <CompareTable
            filteredData1={filteredData1}
            filteredData2={filteredData2}
            period1Label={period1Label}
            period2Label={period2Label}
            activeTab="expense"
          />
        </>
      ) : (
        <div className={styles.emptyState}>
          기간을 선택하면 비교 결과가 표시됩니다
        </div>
      )}
    </div>
  )
}
