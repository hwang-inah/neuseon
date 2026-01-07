// 목표 입력 컴포넌트

import { useState, useEffect, useRef } from 'react'
import { formatCurrency, parseNumber } from '@/shared/utils/formatUtils'
import { debugLog } from '@/shared/utils/debug'
import styles from './GoalInput.module.css'

export default function GoalInput({ 
  goalType, // 'monthly' or 'yearly'
  year,
  month, // monthly일 때만 사용
  existingGoal,
  onSave,
  onDelete, // 추가
  saving
}) {
  const [incomeGoal, setIncomeGoal] = useState('')
  const [profitGoal, setProfitGoal] = useState('')
  
  // existingGoal의 id를 추적하여 실제 변경 시에만 state 업데이트
  const prevGoalIdRef = useRef(existingGoal?.id)

  // 기존 목표 불러오기 (existingGoal이 실제로 변경될 때만)
  useEffect(() => {
    const currentGoalId = existingGoal?.id
    
    // existingGoal이 실제로 변경된 경우에만 state 업데이트
    if (prevGoalIdRef.current !== currentGoalId) {
      prevGoalIdRef.current = currentGoalId
      
      if (existingGoal) {
        setIncomeGoal(existingGoal.income_goal.toString())
        setProfitGoal(existingGoal.profit_goal.toString())
      } else {
        // 목표가 없으면 입력값 초기화
        setIncomeGoal('')
        setProfitGoal('')
      }
    }
  }, [existingGoal]) // existingGoal만 의존성으로 유지

  const handleSave = async () => {
    const income = parseNumber(incomeGoal)
    const profit = parseNumber(profitGoal)

    if (income <= 0 && profit <= 0) {
      alert('최소 하나의 목표를 입력해주세요')
      return
    }

    if (profit > income) {
      alert('순익 목표는 매출 목표보다 클 수 없습니다')
      return
    }

    await onSave(goalType, year, month, income, profit)
  }

  const handleDelete = async () => {
    if (!existingGoal) return

    const confirmMessage = goalType === 'monthly'
      ? `${year}년 ${month}월 목표를 삭제하시겠습니까?`
      : `${year}년 연간 목표를 삭제하시겠습니까?`

    if (!confirm(confirmMessage)) return

    await onDelete(existingGoal.id)
  }

  const title = goalType === 'monthly' 
    ? `${year}년 ${month}월 목표`
    : `${year}년 연간 목표`

  debugLog('GoalInput:', { goalType, year, month, existingGoal })

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        {existingGoal && (
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={saving}
          >
            삭제
          </button>
        )}
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor={`${goalType}-${year}-${month || 'yearly'}-income`} className={styles.label}>매출 목표</label>
        <input
          id={`${goalType}-${year}-${month || 'yearly'}-income`}
          name={`${goalType}_income_goal`}
          type="text"
          className={styles.input}
          value={incomeGoal}
          onChange={(e) => setIncomeGoal(e.target.value)}
          placeholder="예: 5000000"
        />
        <span className={styles.preview}>
          {incomeGoal ? formatCurrency(parseNumber(incomeGoal)) : '0원'}
        </span>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor={`${goalType}-${year}-${month || 'yearly'}-profit`} className={styles.label}>순익 목표</label>
        <input
          id={`${goalType}-${year}-${month || 'yearly'}-profit`}
          name={`${goalType}_profit_goal`}
          type="text"
          className={styles.input}
          value={profitGoal}
          onChange={(e) => setProfitGoal(e.target.value)}
          placeholder="예: 2000000"
        />
        <span className={styles.preview}>
          {profitGoal ? formatCurrency(parseNumber(profitGoal)) : '0원'}
        </span>
      </div>

      <button
        className={styles.saveButton}
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? '저장 중...' : '목표 저장'}
      </button>
    </div>
  )
}