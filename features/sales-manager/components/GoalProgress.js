// 목표 진행률 표시 컴포넌트

import { useMemo } from 'react'
import { formatCurrency } from '@/shared/utils/formatUtils'
import { calculateSum, calculateProfit } from '@/features/sales-manager/utils/calculateUtils'
import { parseDateAsNumbers } from '@/shared/utils/dateUtils'
import styles from './GoalProgress.module.css'

export default function GoalProgress({ 
  goalType, // 'monthly' or 'yearly'
  goal, // 목표 객체
  sales, // 매출 데이터
  year, // 선택된 연도
  month // 선택된 월 (monthly일 때만)
}) {
  // 현재 실적 계산
  const currentStats = useMemo(() => {
    if (!sales || sales.length === 0) {
      return { income: 0, profit: 0 }
    }

    // 필터링
    let filteredSales = sales
    if (goalType === 'monthly') {
      // 선택된 년/월 데이터만
      filteredSales = sales.filter(s => {
        const { year: saleYear, month: saleMonth } = parseDateAsNumbers(s.date)
        return saleYear === year && saleMonth === month
      })
    } else {
      // 선택된 연도 데이터만
      filteredSales = sales.filter(s => {
        const { year: saleYear } = parseDateAsNumbers(s.date)
        return saleYear === year
      })
    }

    const income = calculateSum(filteredSales, 'income')
    const profit = calculateProfit(filteredSales)

    return { income, profit }
  }, [sales, goalType, year, month])

  // 진행률 계산
  const incomeRate = goal?.income_goal > 0 
    ? Math.max(0, Math.min(100, Math.round((currentStats.income / goal.income_goal) * 100)))
    : 0

  const profitRate = goal?.profit_goal > 0
    ? Math.max(0, Math.min(100, Math.round((currentStats.profit / goal.profit_goal) * 100)))
    : 0

  // 일 평균 계산 (월별 목표일 때만)
  const dailyAverage = useMemo(() => {
    if (goalType !== 'monthly' || !goal) return null

    const now = new Date()
    const selectedDate = new Date(year, month - 1, 1)
    
    // 미래 월이면 계산 안 함
    if (selectedDate > now) return null

    const currentDay = selectedDate.getMonth() === now.getMonth() && selectedDate.getFullYear() === now.getFullYear()
      ? now.getDate()
      : new Date(year, month, 0).getDate() // 해당 월의 마지막 날

    const daysInMonth = new Date(year, month, 0).getDate()
    const remainingDays = daysInMonth - currentDay

    if (remainingDays <= 0) return null

    const remainingIncome = Math.max(0, goal.income_goal - currentStats.income)
    const remainingProfit = Math.max(0, goal.profit_goal - currentStats.profit)

    return {
      currentDay,
      daysInMonth,
      remainingDays,
      dailyIncomeNeeded: Math.round(remainingIncome / remainingDays),
      dailyProfitNeeded: Math.round(remainingProfit / remainingDays)
    }
  }, [goalType, goal, currentStats, year, month])

  if (!goal) {
    return (
      <div className={styles.empty}>
        <p>목표를 설정하면 진행 상황을 확인할 수 있습니다</p>
      </div>
    )
  }

  const title = goalType === 'monthly'
    ? `${year}년 ${month}월 달성 현황`
    : `${year}년 연간 달성 현황`

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>{title}</h3>

      {/* 매출 진행률 */}
      <div className={styles.progressSection}>
        <div className={styles.header}>
          <span className={styles.label}>📈 매출</span>
          <span className={styles.percentage}>{incomeRate}%</span>
        </div>
        
        <div className={styles.amounts}>
          <span className={styles.current}>{formatCurrency(currentStats.income)}</span>
          <span className={styles.divider}>/</span>
          <span className={styles.goal}>{formatCurrency(goal.income_goal)}</span>
        </div>

        {incomeRate < 100 && (
          <div className={styles.remaining}>
            목표까지 {formatCurrency(goal.income_goal - currentStats.income)} 남음
          </div>
        )}

        <div className={styles.progressBar}>
          <div 
            className={`${styles.progressFill} ${
              incomeRate >= 100 ? styles.complete :
              incomeRate >= 80 ? styles.good :
              incomeRate >= 50 ? styles.normal :
              styles.low
            }`}
            style={{ width: `${incomeRate}%` }}
          />
        </div>
      </div>

      {/* 순익 진행률 */}
      <div className={styles.progressSection}>
        <div className={styles.header}>
          <span className={styles.label}>💰 순익</span>
          <span className={styles.percentage}>{profitRate}%</span>
        </div>
        
        <div className={styles.amounts}>
          <span className={styles.current}>{formatCurrency(currentStats.profit)}</span>
          <span className={styles.divider}>/</span>
          <span className={styles.goal}>{formatCurrency(goal.profit_goal)}</span>
        </div>

        {profitRate < 100 && currentStats.profit >= 0 && (
          <div className={styles.remaining}>
            목표까지 {formatCurrency(goal.profit_goal - currentStats.profit)} 남음
          </div>
        )}

        {currentStats.profit < 0 && (
          <div className={styles.remaining} style={{ color: '#dc2626' }}>
            현재 적자 상태입니다
          </div>
        )}

        <div className={styles.progressBar}>
          <div 
            className={`${styles.progressFill} ${
              profitRate >= 100 ? styles.complete :
              profitRate >= 80 ? styles.good :
              profitRate >= 50 ? styles.normal :
              styles.low
            }`}
            style={{ width: `${profitRate}%` }}
          />
        </div>
      </div>

      {/* 일 평균 (월별만) */}
      {dailyAverage && (
        <div className={styles.dailyStats}>
          <div className={styles.dailyItem}>
            <span className={styles.dailyLabel}>남은 일수</span>
            <span className={styles.dailyValue}>{dailyAverage.remainingDays}일</span>
          </div>
          <div className={styles.dailyItem}>
            <span className={styles.dailyLabel}>일 평균 필요 매출</span>
            <span className={styles.dailyValue}>
              {formatCurrency(dailyAverage.dailyIncomeNeeded)}
            </span>
          </div>
          <div className={styles.dailyItem}>
            <span className={styles.dailyLabel}>일 평균 필요 순익</span>
            <span className={styles.dailyValue}>
              {formatCurrency(dailyAverage.dailyProfitNeeded)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}