// 컬럼별 비교표 컴포넌트 (구분/거래처명/내용)

import { useState, useMemo } from 'react'
import { formatCurrency } from '@/shared/utils/formatUtils'
import styles from './CompareTable.module.css'

const COLUMN_OPTIONS = [
  { value: 'category', label: '구분' },
  { value: 'vendor', label: '거래처명' },
  { value: 'description', label: '내용' }
]

export default function CompareTable({ 
  filteredData1, 
  filteredData2, 
  period1Label, 
  period2Label,
  activeTab = 'income'
}) {
  const [selectedColumn, setSelectedColumn] = useState('category')

  // 선택한 컬럼별 데이터 집계
  const tableData = useMemo(() => {
    if (!filteredData1 || !filteredData2) return []

    // 해당 탭 데이터만 필터링
    const data1 = filteredData1.filter(s => s.type === activeTab)
    const data2 = filteredData2.filter(s => s.type === activeTab)

    // 컬럼 값별로 금액 집계
    const values1 = {}
    const values2 = {}

    data1.forEach(sale => {
      const key = sale[selectedColumn] || '미분류'
      values1[key] = (values1[key] || 0) + sale.amount
    })

    data2.forEach(sale => {
      const key = sale[selectedColumn] || '미분류'
      values2[key] = (values2[key] || 0) + sale.amount
    })

    // 모든 값 수집
    const allKeys = new Set([...Object.keys(values1), ...Object.keys(values2)])

    // 테이블 데이터 생성
    const result = Array.from(allKeys).map(key => {
      const amount1 = values1[key] || 0
      const amount2 = values2[key] || 0
      const diff = amount1 - amount2
      const rate = amount2 > 0 ? ((diff / amount2) * 100).toFixed(1) : (amount1 > 0 ? 100 : 0)

      return {
        key,
        amount1,
        amount2,
        diff,
        rate: parseFloat(rate)
      }
    })

    // 오름차순 정렬
    return result.sort((a, b) => a.key.localeCompare(b.key, 'ko'))
  }, [filteredData1, filteredData2, selectedColumn, activeTab])

  if (!filteredData1 || !filteredData2) return null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>전월대비 지출 비교 (항목별)</h2>
        
        <select 
          className={styles.select}
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
        >
          {COLUMN_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{COLUMN_OPTIONS.find(o => o.value === selectedColumn)?.label}</th>
              <th>{period1Label}</th>
              <th>{period2Label}</th>
              <th>증감</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={4} className={styles.empty}>데이터가 없습니다</td>
              </tr>
            ) : (
              tableData.map((row, index) => (
                <tr key={index}>
                  <td className={styles.keyCell}>{row.key}</td>
                  <td className={styles.amountCell}>{formatCurrency(row.amount1)}</td>
                  <td className={styles.amountCell}>{formatCurrency(row.amount2)}</td>
                  <td className={`${styles.rateCell} ${
                    row.rate > 0 ? styles.positive : 
                    row.rate < 0 ? styles.negative : styles.neutral
                  }`}>
                    {row.rate > 0 ? '+' : ''}{row.rate}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}