// 비교 분석 로직 관리 훅

import { useState, useEffect, useMemo } from 'react'
import { calculateSum, calculateProfit, calculateGrowthRate } from '../utils/calculateUtils'

export function useCompare(sales) {
  const [periodType, setPeriodType] = useState('month') // 'month', 'year'
  const [period1, setPeriod1] = useState('')
  const [period2, setPeriod2] = useState('')

  // 사용 가능한 기간 추출
  const availablePeriods = useMemo(() => {
    if (!sales || sales.length === 0) return []

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

    return Array.from(periods).sort().reverse()
  }, [sales, periodType])

  // 기본값 설정 (최근 2개 기간)
  useEffect(() => {
    if (availablePeriods.length >= 2) {
      setPeriod1(availablePeriods[0])
      setPeriod2(availablePeriods[1])
    } else if (availablePeriods.length === 1) {
      setPeriod1(availablePeriods[0])
      setPeriod2('')
    }
  }, [availablePeriods])

  // 기간별 데이터 필터링
  const filteredData1 = useMemo(() => {
    if (!period1 || !sales) return []
    return sales.filter(sale => sale.date.startsWith(period1))
  }, [sales, period1])

  const filteredData2 = useMemo(() => {
    if (!period2 || !sales) return []
    return sales.filter(sale => sale.date.startsWith(period2))
  }, [sales, period2])

  // 비교 결과 계산
  const comparisonResult = useMemo(() => {
    if (!period1 || !period2) return null

    // 매출/지출/순익 계산
    const income1 = calculateSum(filteredData1, 'income')
    const expense1 = calculateSum(filteredData1, 'expense')
    const profit1 = calculateProfit(filteredData1)

    const income2 = calculateSum(filteredData2, 'income')
    const expense2 = calculateSum(filteredData2, 'expense')
    const profit2 = calculateProfit(filteredData2)

    // 증감률 계산
    const incomeGrowth = calculateGrowthRate(income1, income2)
    const expenseGrowth = calculateGrowthRate(expense1, expense2)
    const profitGrowth = calculateGrowthRate(profit1, profit2)

    return {
      period1: { income: income1, expense: expense1, profit: profit1 },
      period2: { income: income2, expense: expense2, profit: profit2 },
      growth: { income: incomeGrowth, expense: expenseGrowth, profit: profitGrowth }
    }
  }, [filteredData1, filteredData2, period1, period2])

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

  return {
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
  }
}