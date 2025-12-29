// 매출/지출 테이블 컴포넌트

import { useState } from 'react'
import { getToday } from '@/shared/utils/dateUtils'
import TableRow from './TableRow'
import FileUpload from '@/features/sales-manager/components/FileUpload'
import styles from './SalesTable.module.css'

export default function SalesTable({ 
  data, 
  type,
  onSave, 
  onDelete,
  onFileUpload,
  onDownloadCSV,
  onDownloadExcel,
  showDetailFields = false // 상세 필드 표시 여부
}) {
  const [editingDate, setEditingDate] = useState(null)
  const [editData, setEditData] = useState(null)
  const [showNewRow, setShowNewRow] = useState(false)
  const [visibleCount, setVisibleCount] = useState(20)
  const [newData, setNewData] = useState({
    date: getToday(),
    category: '',
    vendor: '',
    description: '',
    card: '',
    transfer: '',
    cash: '',
    memo: ''
  })

  const handleEdit = (row) => {
    setEditingDate(row.date)
    setEditData({ ...row })
  }

  const handleCancelEdit = () => {
    setEditingDate(null)
    setEditData(null)
  }

  const handleCancelNew = () => {
    setShowNewRow(false)
    setNewData({
      date: getToday(),
      category: '',
      vendor: '',
      description: '',
      card: '',
      transfer: '',
      cash: '',
      memo: '',
    })
  }

  const handleSaveEdit = async () => {
    await onSave(editData, data.find((d) => d.date === editingDate))
    handleCancelEdit()
  }

  const handleSaveNew = async () => {
    console.log('=== handleSaveNew 호출 ===')
    console.log('newData:', newData)
    console.log('onSave:', onSave)
    
    await onSave(newData, null)
    handleCancelNew()
  }

  const labelPrefix = type === 'expense' ? '지출' : '매출'

  return (
    <div>
      <div className={styles.tableWrapper}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FileUpload
            onUpload={onFileUpload}
            onDownloadCSV={onDownloadCSV}
            onDownloadExcel={onDownloadExcel}
          />
          
          <button onClick={() => setShowNewRow(true)} className={styles.addButton}>
            + 행 추가
          </button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '120px' }}>일자</th>
              {showDetailFields && (
                <>
                  <th style={{ width: '120px' }}>구분</th>
                  <th style={{ width: '120px' }}>거래처명</th>
                  <th style={{ width: '150px' }}>내용</th>
                </>
              )}
              <th style={{ width: '120px' }}>카드</th>
              <th style={{ width: '120px' }}>계좌이체</th>
              <th style={{ width: '120px' }}>현금</th>
              <th style={{ width: '120px' }}>총금액</th>
              <th style={{ width: '120px' }}>메모</th>
              <th style={{ width: '140px' }}>작업</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 && !showNewRow && (
              <tr>
                <td colSpan={showDetailFields ? 10 : 7} className={styles.emptyMessage}>
                  데이터가 없습니다
                </td>
              </tr>
            )}

            {showNewRow && (
              <TableRow
                mode="new"
                data={newData}
                onDataChange={setNewData}
                onSave={handleSaveNew}
                onCancel={handleCancelNew}
                showDetailFields={showDetailFields}
              />
            )}

            {data.slice(0, visibleCount).map(row => (
              <TableRow
                key={row.rowId}
                mode={editingDate === row.date ? 'edit' : 'view'}
                data={editingDate === row.date ? editData : row}
                onDataChange={setEditData}
                onSave={handleSaveEdit}
                onEdit={() => handleEdit(row)}
                onDelete={() => onDelete(row)}
                onCancel={handleCancelEdit}
                showDetailFields={showDetailFields}
              />
            ))}
          </tbody>
        </table>
        
        {/* 더보기 버튼 */}
        {data.length > visibleCount && (
          <div style={{ 
            textAlign: 'center', 
            padding: '1.5rem',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setVisibleCount(prev => prev + 20)}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#fff',
                border: '1px solid #8B7355',
                borderRadius: '8px',
                color: '#8B7355',
                fontSize: '0.95rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#8B7355'
                e.target.style.color = '#fff'
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#fff'
                e.target.style.color = '#8B7355'
              }}
            >
              + 더보기 ({data.length - visibleCount}개 남음)
            </button>
          </div>
        )}
      </div>  
    </div>
  )
}