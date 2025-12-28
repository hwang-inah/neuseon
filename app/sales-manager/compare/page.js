// 비교분석 페이지

'use client'

import { useState, useEffect } from 'react'
import { useSalesData } from '@/features/sales-manager/hooks/useSalesData'
import { formatCurrency } from '@/shared/utils/formatUtils'
import { calculateSum, calculateProfit, calculateGrowthRate } from '@/features/sales-manager/utils/calculateUtils'
import { getMonthStart, getMonthEnd } from '@/shared/utils/dateUtils'
import styles from './page.module.css'

export default function ComparePage() {
  const { sales, loading } = useSalesData()

  const [periodType, setPeriodType] = useState('month') // 'day', 'week', 'month', 'year'
  const [period1, setPeriod1] = useState('')
  const [period2, setPeriod2] = useState('')
  const [availablePeriods, setAvailablePeriods] = useState([])
  const [comparisonResult, setComparisonResult] = useState(null)

  // 사용 가능한 기간 추출
  useEffect(() => {
    if (sales && sales.length > 0) {
      const periods = new Set()
      
      sales.forEach(sale => {
        if (periodType === 'month') {
          const [year, month] = sale.date.split('-')
          periods.add(`${year}-${month}`)
        } else if (periodType === 'year') {
          const [year] = sale.date.split('-')
          periods.add(year)
        }
      })

      const sortedPeriods = Array.from(periods).sort().reverse()
      setAvailablePeriods(sortedPeriods)

      // 기본값 설정 (최근 2개 기간)
      if (sortedPeriods.length >= 2) {
        setPeriod1(sortedPeriods[0])
        setPeriod2(sortedPeriods[1])
      } else if (sortedPeriods.length === 1) {
        setPeriod1(sortedPeriods[0])
        setPeriod2('')
      }
    }
  }, [sales, periodType])

  // 비교 실행
  const handleCompare = () => {
    if (!period1 || !period2) {
      alert('두 기간을 모두 선택해주세요')
      return
    }

    // 기간별 데이터 필터링
    const data1 = sales.filter(sale => {
      if (periodType === 'month') {
        return sale.date.startsWith(period1)
      } else if (periodType === 'year') {
        return sale.date.startsWith(period1)
      }
      return false
    })

    const data2 = sales.filter(sale => {
      if (periodType === 'month') {
        return sale.date.startsWith(period2)
      } else if (periodType === 'year') {
        return sale.date.startsWith(period2)
      }
      return false
    })

    // 매출/지출/순익 계산
    const income1 = calculateSum(data1, 'income')
    const expense1 = calculateSum(data1, 'expense')
    const profit1 = calculateProfit(data1)

    const income2 = calculateSum(data2, 'income')
    const expense2 = calculateSum(data2, 'expense')
    const profit2 = calculateProfit(data2)

    // 증감률 계산
    const incomeGrowth = calculateGrowthRate(income1, income2)
    const expenseGrowth = calculateGrowthRate(expense1, expense2)
    const profitGrowth = calculateGrowthRate(profit1, profit2)

    setComparisonResult({
      period1: {
        income: income1,
        expense: expense1,
        profit: profit1
      },
      period2: {
        income: income2,
        expense: expense2,
        profit: profit2
      },
      growth: {
        income: incomeGrowth,
        expense: expenseGrowth,
        profit: profitGrowth
      }
    })
  }

  // 기간 표시 포맷
  const formatPeriodLabel = (period) => {
    if (!period) return ''
    
    if (periodType === 'month') {
      const [year, month] = period.split('-')
      return `${year}년 ${parseInt(month)}월`
    } else if (periodType === 'year') {
      return `${period}년`
    }
    return period
  }

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>비교분석</h1>

      {/* 기간 선택 */}
      <div className={styles.periodSelector}>
        {/* 기간 타입 */}
        <div className={styles.periodButtons}>
          <button
            className={`${styles.periodButton} ${periodType === 'month' ? styles.periodButtonActive : ''}`}
            onClick={() => setPeriodType('month')}
          >
            월별
          </button>
          <button
            className={`${styles.periodButton} ${periodType === 'year' ? styles.periodButtonActive : ''}`}
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

          <button className={styles.compareButton} onClick={handleCompare}>
            비교하기
          </button>
        </div>
      </div>

      {/* 비교 결과 */}
      {comparisonResult ? (
        <div className={styles.resultSection}>
          <h2 className={styles.resultTitle}>
            {formatPeriodLabel(period1)} vs {formatPeriodLabel(period2)}
          </h2>

          <div className={styles.comparisonGrid}>
            {/* 매출 */}
            <div className={styles.comparisonCard}>
              <div className={styles.cardTitle}>매출</div>
              <div className={styles.cardValues}>
                <span className={styles.cardLabel}>{formatPeriodLabel(period1)}</span>
                <span className={styles.cardAmount}>{formatCurrency(comparisonResult.period1.income)}</span>
              </div>
              <div className={styles.cardValues}>
                <span className={styles.cardLabel}>{formatPeriodLabel(period2)}</span>
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
            <div className={styles.comparisonCard}>
              <div className={styles.cardTitle}>지출</div>
              <div className={styles.cardValues}>
                <span className={styles.cardLabel}>{formatPeriodLabel(period1)}</span>
                <span className={styles.cardAmount}>{formatCurrency(comparisonResult.period1.expense)}</span>
              </div>
              <div className={styles.cardValues}>
                <span className={styles.cardLabel}>{formatPeriodLabel(period2)}</span>
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
            <div className={styles.comparisonCard}>
              <div className={styles.cardTitle}>순익</div>
              <div className={styles.cardValues}>
                <span className={styles.cardLabel}>{formatPeriodLabel(period1)}</span>
                <span className={styles.cardAmount}>{formatCurrency(comparisonResult.period1.profit)}</span>
              </div>
              <div className={styles.cardValues}>
                <span className={styles.cardLabel}>{formatPeriodLabel(period2)}</span>
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
      ) : (
        <div className={styles.resultSection}>
          <div className={styles.emptyState}>
            기간을 선택하고 "비교하기" 버튼을 눌러주세요
          </div>
        </div>
      )}
    </div>
  )
}