// 매출/지출 CRUD

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TEMP_USER_ID } from '@/constants/common'

export function useSalesData() {
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 데이터 가져오기
  const fetchSales = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', TEMP_USER_ID)
        .order('date', { ascending: false })

      if (error) throw error
      
      // 새 배열로 강제 업데이트
      setSales([...(data || [])])
      
      console.log('fetchSales 완료, 데이터 개수:', data?.length || 0)
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
      const { data, error } = await supabase
        .from('sales')
        .insert([{
          user_id: TEMP_USER_ID,
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

  // 추가 (복수) - 새로 추가!
  const addSales = async (salesData) => {
    try {
      const dataToInsert = salesData.map(sale => ({
        user_id: TEMP_USER_ID,
        ...sale
      }))

      const { data, error } = await supabase
        .from('sales')
        .insert(dataToInsert)
        .select()

      if (error) throw error
      
      // 즉시 새로고침
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
      const { data, error } = await supabase
        .from('sales')
        .update(saleData)
        .eq('id', id)
        .eq('user_id', TEMP_USER_ID)
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
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
        .eq('user_id', TEMP_USER_ID)

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
      const { error } = await supabase
        .from('sales')
        .delete()
        .in('id', ids)
        .eq('user_id', TEMP_USER_ID)

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
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('user_id', TEMP_USER_ID)
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
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('user_id', TEMP_USER_ID)

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
  }, [])

  return {
    sales,
    loading,
    error,
    fetchSales,
    addSale,
    addSales, // 새로 추가!
    updateSale,
    deleteSale,
    deleteSales,
    deleteSalesByPeriod,
    deleteAllSales
  }
}