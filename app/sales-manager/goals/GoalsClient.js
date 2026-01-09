// 목표설정 페이지 - Client Component

'use client'

import { useState, useMemo } from 'react'
import { useSalesData } from '@/features/sales-manager/hooks/useSalesData'
import { useGoals } from '@/features/sales-manager/hooks/useGoals'
import GoalInput from '@/features/sales-manager/components/GoalInput'
import GoalProgress from '@/features/sales-manager/components/GoalProgress'
import { parseDate } from '@/shared/utils/dateUtils'
import { calculateSum } from '@/features/sales-manager/utils/calculateUtils'
import { debugLog } from '@/shared/utils/debug'
import styles from './page.module.css'

const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG === 'true'

export default function GoalsClient() {
  debugLog('🎯 GoalsPage 렌더링됨!')
  
  const { sales, loading: salesLoading } = useSalesData()
  const {
    getGoal,
    saveGoal,
    deleteGoal,
    saving
  } = useGoals()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // 선택된 연도/월
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedMonth, setSelectedMonth] = useState(currentMonth)

  // 목표 데이터 조회 (getGoal은 안정적인 함수 참조이므로 직접 호출)
  const monthlyGoal = getGoal('monthly', selectedYear, selectedMonth)
  const yearlyGoal = getGoal('yearly', selectedYear, null)
  
  // 목표 ID를 추적하여 실제 변경 시에만 인사이트 재계산
  const monthlyGoalId = monthlyGoal?.id ?? null
  const yearlyGoalId = yearlyGoal?.id ?? null

  // 동적 인사이트 생성 (의존성 변경 시에만 재계산)
  const insight = useMemo(() => {
    debugLog('===== getInsight 실행 =====', {
      monthlyGoal,
      yearlyGoal,
      salesLength: sales.length,
      selectedYear,
      selectedMonth
    })

    if (!monthlyGoal && !yearlyGoal) {
      return '목표를 설정하여 달성률을 추적하세요.'
    }

    const insights = []

    // 월별 목표 인사이트
    if (monthlyGoal && sales.length > 0) {
      // 해당 월 데이터 필터링
      const monthStr = String(selectedMonth).padStart(2, '0')
      const monthSales = sales.filter(s => {
        const { year, month } = parseDate(s.date)
        return year === String(selectedYear) && month === monthStr
      })
      
      // 매출 합계 계산 (type이 'income'인 것만)
      const currentIncome = calculateSum(monthSales, 'income')

      debugLog('월별 인사이트:', { 
        selectedYear, 
        selectedMonth, 
        monthSales: monthSales.length,
        incomeCount: monthSales.filter(s => s.type === 'income').length,
        expenseCount: monthSales.filter(s => s.type === 'expense').length,
        currentIncome, 
        goal: monthlyGoal.income_goal,
        sample: monthSales[0]
      })
      
      const incomeRate = monthlyGoal.income_goal > 0 
        ? Math.round((currentIncome / monthlyGoal.income_goal) * 100) 
        : 0

      // 목표까지 남은 금액
      const remainingAmount = monthlyGoal.income_goal - currentIncome

      // 현재 월인지 확인
      const now = new Date()
      const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1

      if (incomeRate >= 100) {
        insights.push(`🎉 ${selectedYear}년 ${selectedMonth}월 매출 목표를 달성했습니다!`)
      } else if (isCurrentMonth) {
        // 현재 월만 진행 중 메시지 + 일매출 필요치
        const today = now.getDate()
        const lastDay = new Date(selectedYear, selectedMonth, 0).getDate()
        const remainingDays = lastDay - today + 1
        
        if (remainingDays > 0 && remainingAmount > 0) {
          const dailyNeed = Math.ceil(remainingAmount / remainingDays)
          insights.push(`목표까지 ${remainingAmount.toLocaleString()}원 남았습니다 (하루 평균 ${dailyNeed.toLocaleString()}원 필요)`)
        } else {
          insights.push(`목표 달성까지 ${100 - incomeRate}% 남았습니다`)
        }
      } else {
        // 과거/미래 월은 달성률만 표시
        insights.push(`${selectedYear}년 ${selectedMonth}월 목표 달성률: ${incomeRate}%`)
      }
    }

    // 연간 목표 인사이트
    if (yearlyGoal && sales.length > 0) {
      // 해당 연도에서 선택된 월까지의 데이터 필터링
      const yearSales = sales.filter(s => {
        const { year, month } = parseDate(s.date)
        const saleYear = Number(year)
        const saleMonth = Number(month)
        
        // 선택된 연도이면서, 선택된 월 이하인 데이터만
        return saleYear === selectedYear && saleMonth <= selectedMonth
      })
      
      // 매출 합계 계산 (type이 'income'인 것만)
      const yearIncome = calculateSum(yearSales, 'income')

      debugLog('연간 인사이트:', { 
        selectedYear,
        selectedMonth,
        yearSales: yearSales.length,
        incomeCount: yearSales.filter(s => s.type === 'income').length,
        expenseCount: yearSales.filter(s => s.type === 'expense').length,
        yearIncome, 
        goal: yearlyGoal.income_goal,
        sample: yearSales[0]
      })
      
      const yearRate = yearlyGoal.income_goal > 0
        ? Math.round((yearIncome / yearlyGoal.income_goal) * 100)
        : 0

      if (yearRate >= 100) {
        insights.push(`${selectedYear}년 연간 목표 달성 완료!`)
      } else {
        insights.push(`${selectedYear}년 연간 목표 ${yearRate}% 달성 중`)
      }
    }

    return insights.length > 0 ? insights.join(', ') : '선택한 기간의 목표를 확인하세요.'
  }, [monthlyGoalId, yearlyGoalId, monthlyGoal, yearlyGoal, sales, selectedYear, selectedMonth])

  const handleSave = async (goalType, year, month, incomeGoal, profitGoal) => {
    const result = await saveGoal(goalType, year, month, incomeGoal, profitGoal)
    if (result.success) {
      alert('목표가 저장되었습니다!')
    } else {
      alert('목표 저장 실패: ' + result.error)
    }
  }

  const handleDelete = async (goalId) => {
    const result = await deleteGoal(goalId)
    if (result.success) {
      alert('목표가 삭제되었습니다!')
    } else {
      alert('목표 삭제 실패: ' + result.error)
    }
  }

  // 연도 옵션 (현재 연도 기준 -1년 ~ +2년)
  const yearOptions = Array.from({ length: 4 }, (_, i) => currentYear - 1 + i)

  // 월 옵션
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  if (salesLoading) {
    return <div className={styles.container}>로딩 중...</div>
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>목표설정</h1>
      
      {/* 동적 인사이트 */}
      <div className={styles.insight}>
        <p className={styles.insightIcon}>🎯</p>
        <p className={styles.insightText}>{insight}</p>
      </div>

      {/* 디버깅 정보 (개발 모드에서만 표시) */}
      {DEBUG_ENABLED && (
        <div style={{ background: '#fff3cd', padding: '1rem', marginBottom: '1rem', borderRadius: '8px', fontSize: '0.875rem' }}>
          <strong>🔍 디버깅:</strong><br/>
          매출 데이터: {sales.length}개<br/>
          월별 목표: {monthlyGoal ? `${monthlyGoal.income_goal}원` : '없음'}<br/>
          연간 목표: {yearlyGoal ? `${yearlyGoal.income_goal}원` : '없음'}<br/>
          선택: {selectedYear}년 {selectedMonth}월
        </div>
      )}

      {/* 연도/월 선택 */}
      <div className={styles.selector}>
        <div className={styles.selectGroup}>
          <label htmlFor="goals-year-select" className={styles.label}>연도 선택</label>
          <select
            id="goals-year-select"
            name="selectedYear"
            className={styles.select}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}년</option>
            ))}
          </select>
        </div>

        <div className={styles.selectGroup}>
          <label htmlFor="goals-month-select" className={styles.label}>월 선택 (월별 목표용)</label>
          <select
            id="goals-month-select"
            name="selectedMonth"
            className={styles.select}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
          >
            {monthOptions.map(month => (
              <option key={month} value={month}>{month}월</option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.content}>
        {/* 왼쪽: 목표 입력 */}
        <div className={styles.inputSection}>
          <h2 className={styles.sectionTitle}>목표 입력</h2>
          
          {/* 월별 목표 */}
          <GoalInput
            goalType="monthly"
            year={selectedYear}
            month={selectedMonth}
            existingGoal={monthlyGoal}
            onSave={handleSave}
            onDelete={handleDelete}
            saving={saving}
          />

          {/* 연간 목표 */}
          <GoalInput
            goalType="yearly"
            year={selectedYear}
            month={null}
            existingGoal={yearlyGoal}
            onSave={handleSave}
            onDelete={handleDelete}
            saving={saving}
          />
        </div>

        {/* 오른쪽: 진행 현황 */}
        <div className={styles.progressSection}>
          <h2 className={styles.sectionTitle}>달성 현황</h2>
          
          {/* 월별 진행률 */}
          <GoalProgress
            goalType="monthly"
            goal={monthlyGoal}
            sales={sales}
            year={selectedYear}
            month={selectedMonth}
          />

          {/* 연간 진행률 */}
          <GoalProgress
            goalType="yearly"
            goal={yearlyGoal}
            sales={sales}
            year={selectedYear}
          />
        </div>
      </div>
    </div>
  )
}
