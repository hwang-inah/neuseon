// 데이터 검증 유틸리티
// 중복 체크 등 검증 로직을 한 곳에서 관리

import { parseNumber } from '@/shared/utils/formatUtils'

/**
 * 완전 중복 체크
 * 날짜, 금액, 추가 필드가 모두 동일한지 확인
 */
export function isDuplicateRow(newRow, existingRow) {
  return (
    newRow.date === existingRow.date &&
    parseNumber(newRow.card) === parseNumber(existingRow.card) &&
    parseNumber(newRow.transfer) === parseNumber(existingRow.transfer) &&
    parseNumber(newRow.cash) === parseNumber(existingRow.cash) &&
    (newRow.category || '') === (existingRow.category || '') &&
    (newRow.vendor || '') === (existingRow.vendor || '') &&
    (newRow.description || '') === (existingRow.description || '') &&
    (newRow.memo || '') === (existingRow.memo || '')
  )
}

/**
 * 배열 내 중복 데이터 찾기
 */
export function findDuplicates(newRows, existingData) {
  const duplicates = []
  const nonDuplicates = []

  newRows.forEach(newRow => {
    const hasDuplicate = existingData.some(existingRow => 
      isDuplicateRow(newRow, existingRow)
    )
    
    if (hasDuplicate) {
      duplicates.push(newRow)
    } else {
      nonDuplicates.push(newRow)
    }
  })

  return { duplicates, nonDuplicates }
}

/**
 * 단일 행 중복 체크
 */
export function checkSingleDuplicate(newRow, existingData) {
  return existingData.some(existingRow => isDuplicateRow(newRow, existingRow))
}