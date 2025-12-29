// 매출 데이터 입력/수정/삭제 관리 훅
// CRUD 핸들러 로직을 한 곳에서 관리

import { useState } from 'react'
import { transformToSalesData } from '../utils/dataTransform'
import { formatCurrency, parseNumber } from '@/shared/utils/formatUtils'
import { TYPE_LABELS } from '@/constants/common'

export function useSalesInput({ 
  activeTab, 
  currentData, 
  addSales, 
  deleteSales,
  confirm 
}) {
  const [isSaving, setIsSaving] = useState(false)

  // 저장 (추가 또는 수정)
  const handleSave = async (tableRow, originalRow) => {
    const card = parseNumber(tableRow.card)
    const transfer = parseNumber(tableRow.transfer)
    const cash = parseNumber(tableRow.cash)
    const total = card + transfer + cash

    if (total <= 0) {
      alert('최소 하나의 금액을 입력해주세요')
      return
    }

    const isEdit = originalRow !== null

    // 신규 입력인 경우 중복 체크
    if (!isEdit) {
      const duplicateRow = currentData.find(existingRow => {
        return (
          tableRow.date === existingRow.date &&
          parseNumber(tableRow.card) === parseNumber(existingRow.card) &&
          parseNumber(tableRow.transfer) === parseNumber(existingRow.transfer) &&
          parseNumber(tableRow.cash) === parseNumber(existingRow.cash) &&
          (tableRow.category || '') === (existingRow.category || '') &&
          (tableRow.vendor || '') === (existingRow.vendor || '') &&
          (tableRow.description || '') === (existingRow.description || '') &&
          (tableRow.memo || '') === (existingRow.memo || '')
        )
      })

      if (duplicateRow) {
        alert('⚠️ 동일한 데이터가 이미 존재합니다.')
        return
      }
    }

    // 최종 확인
    const result = await confirm({
      title: isEdit ? '수정 확인' : `${TYPE_LABELS[activeTab]} 추가`,
      message: isEdit ? '이 내용으로 수정하시겠습니까?' : '이 내용으로 추가하시겠습니까?',
      type: isEdit ? 'update' : 'create',
      confirmText: isEdit ? '수정' : '추가',
      data: {
        일자: tableRow.date,
        카드: card > 0 ? formatCurrency(card) : '-',
        계좌이체: transfer > 0 ? formatCurrency(transfer) : '-',
        현금: cash > 0 ? formatCurrency(cash) : '-',
        총금액: formatCurrency(total),
        메모: tableRow.memo || '-'
      }
    })

    if (!result) return

    setIsSaving(true)

    try {
      if (isEdit) {
        // 수정: 기존 데이터 삭제
        const idsToDelete = originalRow.allIds || Object.values(originalRow.ids).filter(Boolean)
        
        if (idsToDelete.length > 0) {
          await deleteSales(idsToDelete)
        }
      }

      // 새 데이터 추가
      const newSales = transformToSalesData(tableRow, activeTab)
      
      const response = await addSales(newSales)
      if (!response.success) {
        alert('저장 실패: ' + response.error)
        setIsSaving(false)
        return
      }
    } finally {
      setTimeout(() => {
        setIsSaving(false)
      }, 300)
    }
  }

  // 삭제
  const handleDelete = async (tableRow) => {
    const result = await confirm({
      title: '⚠️ 삭제 확인',
      message: '이 날짜의 모든 항목을 삭제하시겠습니까?\n복구할 수 없습니다.',
      type: 'delete',
      confirmText: '삭제'
    })

    if (!result) return

    const idsToDelete = tableRow.allIds || Object.values(tableRow.ids).filter(Boolean)
    
    if (idsToDelete.length > 0) {
      const response = await deleteSales(idsToDelete)
      if (!response.success) {
        alert('삭제 실패: ' + response.error)
      }
    }
  }

  return {
    handleSave,
    handleDelete,
    isSaving
  }
}