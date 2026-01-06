// 목표 설정 관리 훅

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useGoals() {
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // 목표 데이터 가져오기
  const fetchGoals = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('목표 조회 실패:', error)
      alert('목표를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGoals()
  }, [])

  // 특정 목표 조회 (월별 또는 연간)
  const getGoal = (goalType, year, month = null) => {
    if (goalType === 'yearly') {
      // 연간 목표: goal_type이 yearly이고 year가 일치하면 됨
      return goals.find(
        g => g.goal_type === 'yearly' && g.year === year
      )
    } else {
      // 월간 목표: goal_type이 monthly이고 year, month 모두 일치
      return goals.find(
        g => g.goal_type === 'monthly' && g.year === year && g.month === month
      )
    }
  }

  // 현재 월 목표 조회
  const getCurrentMonthGoal = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    return getGoal('monthly', year, month)
  }

  // 현재 연도 목표 조회
  const getCurrentYearGoal = () => {
    const now = new Date()
    const year = now.getFullYear()
    return getGoal('yearly', year, null)
  }

  // 목표 저장 (추가 또는 수정)
  const saveGoal = async (goalType, year, month, incomeGoal, profitGoal) => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('로그인이 필요합니다')

      // 기존 목표 확인
      const existingGoal = getGoal(goalType, year, month)

      const goalData = {
        user_id: user.id,
        goal_type: goalType,
        year: year,
        month: goalType === 'monthly' ? month : null,
        income_goal: incomeGoal,
        profit_goal: profitGoal
      }

      let result
      if (existingGoal) {
        // 수정
        const { data, error } = await supabase
          .from('goals')
          .update({
            income_goal: incomeGoal,
            profit_goal: profitGoal,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingGoal.id)
          .select()

        if (error) throw error
        result = data[0]
      } else {
        // 추가
        const { data, error } = await supabase
          .from('goals')
          .insert(goalData)
          .select()

        if (error) throw error
        result = data[0]
      }

      // 로컬 상태 업데이트
      await fetchGoals()
      
      return { success: true, data: result }
    } catch (error) {
      console.error('목표 저장 실패:', error)
      return { success: false, error: error.message }
    } finally {
      setSaving(false)
    }
  }

  // 목표 삭제
  const deleteGoal = async (goalId) => {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error

      await fetchGoals()
      return { success: true }
    } catch (error) {
      console.error('목표 삭제 실패:', error)
      return { success: false, error: error.message }
    }
  }

  return {
    goals,
    loading,
    saving,
    getGoal,
    getCurrentMonthGoal,
    getCurrentYearGoal,
    saveGoal,
    deleteGoal,
    refreshGoals: fetchGoals
  }
}