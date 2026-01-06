// 대시보드 로직 관리 훅
// 기간 선택, 데이터 필터링, 요약 계산

import { useState, useMemo } from 'react'

export function useDashboard(sales) {
  const [period, setPeriod] = useState('thisMonth') // thisMonth, lastMonth, thisYear

  // 현재 날짜 기준 계산
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
  const lastMonth = now.getMonth() === 0 
    ? { year: currentYear - 1, month: '12' }
    : { year: currentYear, month: String(now.getMonth()).padStart(2, '0') }

  // 기간별 데이터 필터링
  const filteredSales = useMemo(() => {
    if (!sales || sales.length === 0) return []

    return sales.filter(sale => {
      const saleDate = sale.date

      switch (period) {
        case 'thisMonth':
          return saleDate.startsWith(`${currentYear}-${currentMonth}`)
        
        case 'lastMonth':
          return saleDate.startsWith(`${lastMonth.year}-${lastMonth.month}`)
        
        case 'thisYear':
          return saleDate.startsWith(String(currentYear))
        
        default:
          return true
      }
    })
  }, [sales, period])

  // 요약 계산
  const summary = useMemo(() => {
    const income = filteredSales
      .filter(s => s.type === 'income')
      .reduce((sum, s) => sum + s.amount, 0)
    
    const expense = filteredSales
      .filter(s => s.type === 'expense')
      .reduce((sum, s) => sum + s.amount, 0)
    
    const profit = income - expense
    const profitRate = income > 0 ? (profit / income) * 100 : 0

    return {
      income,
      expense,
      profit,
      profitRate
    }
  }, [filteredSales])

  // 기간 라벨
  const periodLabel = useMemo(() => {
    switch (period) {
      case 'thisMonth':
        return `${currentYear}년 ${currentMonth}월`
      case 'lastMonth':
        return `${lastMonth.year}년 ${lastMonth.month}월`
      case 'thisYear':
        return `${currentYear}년`
      default:
        return ''
    }
  }, [period])

  // 그래프 데이터 생성
  const chartData = useMemo(() => {
    if (period === 'thisYear') {
      // 월별 데이터
      const monthlyData = {}
      
      filteredSales.forEach(sale => {
        const month = sale.date.substring(5, 7) // YYYY-MM-DD에서 MM 추출
        if (!monthlyData[month]) {
          monthlyData[month] = { income: 0, expense: 0 }
        }
        if (sale.type === 'income') {
          monthlyData[month].income += sale.amount
        } else {
          monthlyData[month].expense += sale.amount
        }
      })

      return Array.from({ length: 12 }, (_, i) => {
        const month = String(i + 1).padStart(2, '0')
        return {
          label: `${i + 1}월`,
          income: monthlyData[month]?.income || 0,
          expense: monthlyData[month]?.expense || 0
        }
      })
    } else {
      // 일별 데이터
      const dailyData = {}
      
      filteredSales.forEach(sale => {
        const day = sale.date.substring(8, 10) // YYYY-MM-DD에서 DD 추출
        if (!dailyData[day]) {
          dailyData[day] = { income: 0, expense: 0 }
        }
        if (sale.type === 'income') {
          dailyData[day].income += sale.amount
        } else {
          dailyData[day].expense += sale.amount
        }
      })

      const daysInMonth = new Date(
        period === 'thisMonth' ? currentYear : lastMonth.year,
        period === 'thisMonth' ? parseInt(currentMonth) : parseInt(lastMonth.month),
        0
      ).getDate()

      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = String(i + 1).padStart(2, '0')
        return {
          label: `${i + 1}일`,
          income: dailyData[day]?.income || 0,
          expense: dailyData[day]?.expense || 0
        }
      })
    }
  }, [filteredSales, period])

  // 비교 그래프 데이터 (이번 달 vs 지난 달)
  const compareData = useMemo(() => {
    // 이번 달 데이터
    const thisMonthSales = sales.filter(sale => 
      sale.date.startsWith(`${currentYear}-${currentMonth}`)
    )

    // 지난 달 데이터
    const lastMonthSales = sales.filter(sale => 
      sale.date.startsWith(`${lastMonth.year}-${lastMonth.month}`)
    )

    const thisMonthDaily = {}
    const lastMonthDaily = {}

    thisMonthSales.forEach(sale => {
      const day = sale.date.substring(8, 10)
      if (!thisMonthDaily[day]) thisMonthDaily[day] = 0
      if (sale.type === 'income') thisMonthDaily[day] += sale.amount
    })

    lastMonthSales.forEach(sale => {
      const day = sale.date.substring(8, 10)
      if (!lastMonthDaily[day]) lastMonthDaily[day] = 0
      if (sale.type === 'income') lastMonthDaily[day] += sale.amount
    })

    const maxDays = Math.max(
      new Date(currentYear, parseInt(currentMonth), 0).getDate(),
      new Date(lastMonth.year, parseInt(lastMonth.month), 0).getDate()
    )

    return Array.from({ length: maxDays }, (_, i) => {
      const day = String(i + 1).padStart(2, '0')
      return {
        label: `${i + 1}일`,
        thisMonth: thisMonthDaily[day] || 0,
        lastMonth: lastMonthDaily[day] || 0
      }
    })
  }, [sales])

  // 인사이트 생성
  const insights = useMemo(() => {
    const result = []

    // 이번 달 데이터
    const thisMonthIncome = sales
      .filter(s => s.date.startsWith(`${currentYear}-${currentMonth}`) && s.type === 'income')
      .reduce((sum, s) => sum + s.amount, 0)
    
    const thisMonthExpense = sales
      .filter(s => s.date.startsWith(`${currentYear}-${currentMonth}`) && s.type === 'expense')
      .reduce((sum, s) => sum + s.amount, 0)

    // 지난 달 데이터
    const lastMonthIncome = sales
      .filter(s => s.date.startsWith(`${lastMonth.year}-${lastMonth.month}`) && s.type === 'income')
      .reduce((sum, s) => sum + s.amount, 0)
    
    const lastMonthExpense = sales
      .filter(s => s.date.startsWith(`${lastMonth.year}-${lastMonth.month}`) && s.type === 'expense')
      .reduce((sum, s) => sum + s.amount, 0)

    // 인사이트 1: 이번 달 데이터 확인
    if (thisMonthIncome === 0 && thisMonthExpense === 0) {
      result.push({
        icon: '✍️',
        text: `이번 달(${currentMonth}월) 매출 데이터를 입력해주세요`
      })
    } else if (lastMonthIncome > 0 && thisMonthIncome > 0) {
      // 지난 달과 이번 달 모두 데이터가 있을 때만 비교
      const incomeChange = ((thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100).toFixed(1)
      if (Math.abs(incomeChange) > 5) {
        result.push({
          icon: incomeChange > 0 ? '📈' : '📉',
          text: `지난 달보다 매출이 ${Math.abs(incomeChange)}% ${incomeChange > 0 ? '증가' : '감소'}했어요`
        })
      }
    }

    // 인사이트 2: 지출 비중 변화 (지난달 대비)
    if (thisMonthIncome > 0 && thisMonthExpense > 0 && lastMonthIncome > 0 && lastMonthExpense > 0) {
      const thisExpenseRate = (thisMonthExpense / (thisMonthIncome + thisMonthExpense) * 100)
      const lastExpenseRate = (lastMonthExpense / (lastMonthIncome + lastMonthExpense) * 100)
      const rateChange = thisExpenseRate - lastExpenseRate
      
      if (Math.abs(rateChange) > 5) {
        result.push({
          icon: rateChange < 0 ? '✨' : '⚠️',
          text: `지출 비중이 지난 달 ${lastExpenseRate.toFixed(1)}%에서 ${thisExpenseRate.toFixed(1)}%로 ${rateChange > 0 ? '증가' : '감소'}했어요`
        })
      }
    }

    // 인사이트 3: 순익률 변화 (지난달 대비)
    if (thisMonthIncome > 0 && lastMonthIncome > 0) {
      const thisMonthProfit = thisMonthIncome - thisMonthExpense
      const lastMonthProfit = lastMonthIncome - lastMonthExpense
      
      const thisProfitRate = (thisMonthProfit / thisMonthIncome * 100)
      const lastProfitRate = (lastMonthProfit / lastMonthIncome * 100)
      const profitChange = thisProfitRate - lastProfitRate
      
      if (Math.abs(profitChange) > 5) {
        result.push({
          icon: profitChange > 0 ? '🎉' : '💡',
          text: `순익률이 지난 달 ${lastProfitRate.toFixed(1)}%에서 ${thisProfitRate.toFixed(1)}%로 ${profitChange > 0 ? '개선됐어요' : '하락했어요'}`
        })
      }
    }

    // 기본 인사이트 (데이터 부족 시)
    if (result.length === 0) {
      result.push({
        icon: '📊',
        text: '더 많은 데이터가 쌓이면 맞춤 인사이트를 제공해드릴게요'
      })
    }

    return result
  }, [sales])

  return {
    period,
    setPeriod,
    periodLabel,
    summary,
    filteredSales,
    chartData,
    compareData,
    insights
  }
}