// 비교분석 페이지

'use client'

import { useSalesData } from '@/features/sales-manager/hooks/useSalesData'
import { useCompare } from '@/features/sales-manager/hooks/useCompare'
import CompareBarChart from '@/features/sales-manager/components/CompareBarChart'
import CompareTable from '@/features/sales-manager/components/CompareTable'
import { formatCurrency } from '@/shared/utils/formatUtils'
import styles from './page.module.css'

export default function ComparePage() {
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

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>
  }

  const period1Label = formatPeriodLabel(period1)
  const period2Label = formatPeriodLabel(period2)

  // 동적 인사이트 생성
  const getInsight = () => {
    if (!comparisonResult || !period1 || !period2) {
      return '기간을 선택하여 비교 분석을 시작하세요.'
    }

    const { growth } = comparisonResult
    const insights = []

    // 매출 인사이트
    if (growth.income > 0) {
      insights.push(`${period2Label} 대비 매출이 ${growth.income}% 증가했습니다!`)
    } else if (growth.income < 0) {
      insights.push(`${period2Label} 대비 매출이 ${Math.abs(growth.income)}% 감소했습니다`)
    } else {
      insights.push(`매출이 이전 기간과 동일합니다`)
    }

    // 지출 인사이트
    if (growth.expense > 0) {
      insights.push(`지출은 ${growth.expense}% 증가했습니다`)
    } else if (growth.expense < 0) {
      insights.push(`지출은 ${Math.abs(growth.expense)}% 감소했습니다!`)
    }

    // 순익 인사이트
    // if (growth.profit > 20) {
    //   insights.push(`순익이 크게 개선되었습니다 (${growth.profit}% 증가)`)
    // } else if (growth.profit < -20) {
    //   insights.push(`순익이 크게 감소했습니다 (${Math.abs(growth.profit)}% 감소)`)
    // }

    return insights.join(', ')
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>비교분석</h1>
      
      {/* 동적 인사이트 */}
      <div className={styles.insight}>
        <p className={styles.insightIcon}>💡</p>
        <p className={styles.insightText}>{getInsight()}</p>
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
            <label className={styles.label}>기준 기간</label>
            <select
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
            <label className={styles.label}>비교 기간</label>
            <select
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