'use client'

import { useState, useEffect } from 'react'
import { getToday } from '@/shared/utils/dateUtils'
import styles from './BulkInputModal.module.css'

const MAX_ROWS = 10

export default function BulkInputModal({ type, onClose, onSave }) {
  const [rows, setRows] = useState([
    {
      id: 1,
      date: getToday(),
      card: '',
      transfer: '',
      cash: '',
      memo: ''
    }
  ])

  // 임시저장 (입력 중 자동 저장)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('bulk-input-draft', JSON.stringify({
        type,
        rows,
        timestamp: Date.now()
      }))
    }, 1000) // 1초 후 저장

    return () => clearTimeout(timer)
  }, [rows, type])

  // 페이지 로드 시 임시저장 복원
  useEffect(() => {
    const draft = localStorage.getItem('bulk-input-draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        const now = Date.now()
        
        // 1시간 이내 데이터만 복원
        if (parsed.type === type && (now - parsed.timestamp) < 60 * 60 * 1000) {
          setRows(parsed.rows)
        }
      } catch (error) {
        console.error('임시저장 복원 실패:', error)
      }
    }
  }, [type])

  const handleAddRow = () => {
    if (rows.length >= MAX_ROWS) {
      alert(`최대 ${MAX_ROWS}개까지 추가할 수 있습니다`)
      return
    }
    
    setRows([...rows, {
      id: rows.length + 1,
      date: getToday(),
      card: '',
      transfer: '',
      cash: '',
      memo: ''
    }])
  }

  const handleRemoveRow = (id) => {
    if (rows.length === 1) return
    setRows(rows.filter(row => row.id !== id))
  }

  const handleChange = (id, field, value) => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ))
  }

  const handleSave = () => {
    // 빈 행 제외
    const validRows = rows.filter(row => {
      const total = (parseFloat(row.card) || 0) + 
                   (parseFloat(row.transfer) || 0) + 
                   (parseFloat(row.cash) || 0)
      return total > 0
    })

    if (validRows.length === 0) {
      alert('최소 1개의 금액을 입력해주세요')
      return
    }

    // 저장
    onSave(validRows)
    
    // 임시저장 삭제
    localStorage.removeItem('bulk-input-draft')
  }

  const handleClose = () => {
    if (rows.some(row => row.card || row.transfer || row.cash || row.memo)) {
      if (!confirm('입력 중인 내용이 있습니다. 닫으시겠습니까?')) {
        return
      }
    }
    localStorage.removeItem('bulk-input-draft')
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {type === 'income' ? '매출' : '지출'} 다중 입력
            <span className={styles.subtitle}>(최대 {MAX_ROWS}개)</span>
          </h2>
          <button onClick={handleClose} className={styles.closeButton}>×</button>
        </div>

        <div className={styles.content}>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>카드</th>
                  <th>계좌이체</th>
                  <th>현금</th>
                  <th>메모</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        id={`bulk-${row.id}-date`}
                        name={`bulk_date_${row.id}`}
                        type="date"
                        value={row.date}
                        onChange={(e) => handleChange(row.id, 'date', e.target.value)}
                        className={styles.input}
                        aria-label={`${row.id}번 행 날짜`}
                      />
                    </td>
                    <td>
                      <input
                        id={`bulk-${row.id}-card`}
                        name={`bulk_card_${row.id}`}
                        type="number"
                        value={row.card}
                        onChange={(e) => handleChange(row.id, 'card', e.target.value)}
                        placeholder="0"
                        className={styles.input}
                        aria-label={`${row.id}번 행 카드`}
                      />
                    </td>
                    <td>
                      <input
                        id={`bulk-${row.id}-transfer`}
                        name={`bulk_transfer_${row.id}`}
                        type="number"
                        value={row.transfer}
                        onChange={(e) => handleChange(row.id, 'transfer', e.target.value)}
                        placeholder="0"
                        className={styles.input}
                        aria-label={`${row.id}번 행 계좌이체`}
                      />
                    </td>
                    <td>
                      <input
                        id={`bulk-${row.id}-cash`}
                        name={`bulk_cash_${row.id}`}
                        type="number"
                        value={row.cash}
                        onChange={(e) => handleChange(row.id, 'cash', e.target.value)}
                        placeholder="0"
                        className={styles.input}
                        aria-label={`${row.id}번 행 현금`}
                      />
                    </td>
                    <td>
                      <input
                        id={`bulk-${row.id}-memo`}
                        name={`bulk_memo_${row.id}`}
                        type="text"
                        value={row.memo}
                        onChange={(e) => handleChange(row.id, 'memo', e.target.value)}
                        placeholder="메모"
                        className={styles.input}
                        aria-label={`${row.id}번 행 메모`}
                      />
                    </td>
                    <td>
                      {rows.length > 1 && (
                        <button
                          onClick={() => handleRemoveRow(row.id)}
                          className={styles.removeButton}
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length < MAX_ROWS && (
            <button onClick={handleAddRow} className={styles.addRowButton}>
              + 행 추가
            </button>
          )}
        </div>

        <div className={styles.footer}>
          <button onClick={handleClose} className={styles.cancelButton}>
            취소
          </button>
          <button onClick={handleSave} className={styles.saveButton}>
            💾 일괄 저장 ({rows.filter(r => r.card || r.transfer || r.cash).length}개)
          </button>
        </div>
      </div>
    </div>
  )
}