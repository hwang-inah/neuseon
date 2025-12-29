// 파일 업로드 관리 훅
// CSV/Excel 업로드 및 중복 처리 로직

import { useState } from 'react'
import { parseFileToSalesData } from '../utils/fileParser'
import { transformToSalesData } from '../utils/dataTransform'
import { findDuplicates } from '../utils/validationUtils'

export function useFileUpload({ 
  activeTab,
  currentData,
  addSales,
  confirm,
  onUploadSuccess 
}) {
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = async (file) => {
    try {
      setIsUploading(true)

      // 파일 파싱
      const salesData = await parseFileToSalesData(file)
      
      if (salesData.length === 0) {
        alert('유효한 데이터가 없습니다')
        return
      }

      // 중복 검사
      const { duplicates, nonDuplicates } = findDuplicates(salesData, currentData)

      // 중복 데이터가 있으면 알림
      if (duplicates.length > 0) {
        alert(`⚠️ 중복 데이터 ${duplicates.length}개를 제외하고 ${nonDuplicates.length}개를 저장합니다.`)
      }

      if (nonDuplicates.length === 0) {
        alert('추가할 데이터가 없습니다. (모두 중복)')
        return
      }

      // 최종 확인
      const result = await confirm({
        title: '파일 업로드 확인',
        message: `${nonDuplicates.length}개의 데이터를 추가하시겠습니까?`,
        type: 'create',
        confirmText: '추가'
      })

      if (!result) return

      // 데이터 변환 및 추가
      const allSales = []
      nonDuplicates.forEach(row => {
        const converted = transformToSalesData(row, activeTab)
        allSales.push(...converted)
      })

      const response = await addSales(allSales)
      
      if (response.success) {
        // 업로드된 데이터의 가장 최근 월 추출
        const latestMonth = extractLatestMonth(nonDuplicates)
        
        // 성공 콜백 실행 (월 이동 등)
        if (onUploadSuccess && latestMonth) {
          onUploadSuccess(latestMonth)
        }
        
        // 성공 메시지
        alert(`${nonDuplicates.length}개 항목이 추가되었습니다.`)
      } else {
        alert('업로드 실패: ' + response.error)
      }
    } catch (error) {
      console.error('파일 처리 실패:', error)
      alert('파일 처리 실패: ' + error.message)
    } finally {
      setIsUploading(false)
    }
  }

  // 업로드된 데이터에서 최신 월 추출
  const extractLatestMonth = (data) => {
    const dates = data
      .map(d => String(d.date))
      .filter(Boolean)
      .sort()
      .reverse()
    
    if (dates.length === 0) return null
    
    const latestDate = dates[0]
    const [year, month] = latestDate.split('-')
    
    if (year && month) {
      return { year, month }
    }
    
    return null
  }

  return {
    handleFileUpload,
    isUploading
  }
}