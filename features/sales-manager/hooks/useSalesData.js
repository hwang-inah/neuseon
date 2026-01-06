// 매출/지출 CRUD

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/shared/contexts/AuthContext'

export function useSalesData() {
  const { user } = useAuth()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 데이터 가져오기
  const fetchSales = async () => {
    try {
      setLoading(true)
      
      if (!user) {
        setSales([])
        setLoading(false)
        return
      }
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) throw error
      
      setSales([...(data || [])])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching sales:', err)
    } finally {
      setLoading(false)
    }
  }

  // 추가 (단일)
  const addSale = async (saleData) => {
    try {
      if (!user) throw new Error('로그인이 필요합니다')

      const { data, error } = await supabase
        .from('sales')
        .insert([{
          user_id: user.id,
          ...saleData
        }])
        .select()

      if (error) throw error
      await fetchSales()
      return { success: true, data }
    } catch (err) {
      console.error('Error adding sale:', err)
      return { success: false, error: err.message }
    }
  }

  // 추가 (복수)
  const addSales = async (salesData) => {
    try {
      if (!user) throw new Error('로그인이 필요합니다')

      const dataToInsert = salesData.map(sale => ({
        user_id: user.id,
        ...sale
      }))

      const { data, error } = await supabase
        .from('sales')
        .insert(dataToInsert)
        .select()

      if (error) throw error
      await fetchSales()
      
      return { success: true, data }
    } catch (err) {
      console.error('Error adding sales:', err)
      return { success: false, error: err.message }
    }
  }

  // 수정
  const updateSale = async (id, saleData) => {
    try {
      if (!user) throw new Error('로그인이 필요합니다')

      const { data, error } = await supabase
        .from('sales')
        .update(saleData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()

      if (error) throw error
      await fetchSales()
      return { success: true, data }
    } catch (err) {
      console.error('Error updating sale:', err)
      return { success: false, error: err.message }
    }
  }

  // 삭제 (단일)
  const deleteSale = async (id) => {
    try {
      if (!user) throw new Error('로그인이 필요합니다')

      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      await fetchSales()
      return { success: true }
    } catch (err) {
      console.error('Error deleting sale:', err)
      return { success: false, error: err.message }
    }
  }

  // 선택 삭제 (여러 개)
  const deleteSales = async (ids) => {
    try {
      if (!user) throw new Error('로그인이 필요합니다')

      const { error } = await supabase
        .from('sales')
        .delete()
        .in('id', ids)
        .eq('user_id', user.id)

      if (error) throw error
      await fetchSales()
      return { success: true }
    } catch (err) {
      console.error('Error deleting sales:', err)
      return { success: false, error: err.message }
    }
  }

  // 기간별 삭제
  const deleteSalesByPeriod = async (startDate, endDate) => {
    try {
      if (!user) throw new Error('로그인이 필요합니다')

      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)

      if (error) throw error
      await fetchSales()
      return { success: true }
    } catch (err) {
      console.error('Error deleting sales by period:', err)
      return { success: false, error: err.message }
    }
  }

  // 전체 삭제
  const deleteAllSales = async () => {
    try {
      if (!user) throw new Error('로그인이 필요합니다')

      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('user_id', user.id)

      if (error) throw error
      await fetchSales()
      return { success: true }
    } catch (err) {
      console.error('Error deleting all sales:', err)
      return { success: false, error: err.message }
    }
  }

  useEffect(() => {
    fetchSales()
  }, [user]) // user 변경 시 데이터 다시 가져오기

  return {
    sales,
    loading,
    error,
    fetchSales,
    addSale,
    addSales,
    updateSale,
    deleteSale,
    deleteSales,
    deleteSalesByPeriod,
    deleteAllSales
  }
}