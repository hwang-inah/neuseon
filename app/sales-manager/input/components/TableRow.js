// 테이블 행 컴포넌트 - 읽기/수정/신규 모드 통합

import { formatCurrency, parseNumber } from '@/shared/utils/formatUtils'
import styles from './TableRow.module.css'

export default function TableRow({ 
  mode = 'view', // 'view', 'edit', 'new'
  data,
  onDataChange,
  onSave,
  onEdit,
  onDelete,
  onCancel,
  showDetailFields = false // 상세 필드 표시 여부
}) {
  // 총금액 계산
  const card = parseNumber(data.card)
  const transfer = parseNumber(data.transfer)
  const cash = parseNumber(data.cash)
  const total = card + transfer + cash

  // 값 변경 핸들러
  const handleChange = (field, value) => {
    if (onDataChange) {
      onDataChange({ ...data, [field]: value })
    }
  }

  // View 모드
  if (mode === 'view') {
    return (
      <tr>
        <td>{data.date}</td>
        {showDetailFields && (
          <>
            <td>{data.category || '-'}</td>
            <td>{data.vendor || '-'}</td>
            <td>{data.description || '-'}</td>
          </>
        )}
        <td>{card > 0 ? formatCurrency(card) : '-'}</td>
        <td>{transfer > 0 ? formatCurrency(transfer) : '-'}</td>
        <td>{cash > 0 ? formatCurrency(cash) : '-'}</td>
        <td className={styles.totalAmount}>{formatCurrency(total)}</td>
        <td>{data.memo || '-'}</td>
        <td>
          <button onClick={onEdit} className={styles.editButton}>
            수정
          </button>
          <button onClick={onDelete} className={styles.deleteButton}>
            삭제
          </button>
        </td>
      </tr>
    )
  }

  // Edit 또는 New 모드
  const isNew = mode === 'new'
  
  return (
    <tr className={isNew ? styles.newRow : ''}>
      <td>
        <input
          type="date"
          className={styles.input}
          value={data.date || ''}
          onChange={(e) => handleChange('date', e.target.value)}
        />
      </td>
      {showDetailFields && (
        <>
          <td>
            <input
              type="text"
              className={styles.input}
              placeholder="구분"
              value={data.category || ''}
              onChange={(e) => handleChange('category', e.target.value)}
            />
          </td>
          <td>
            <input
              type="text"
              className={styles.input}
              placeholder="거래처명"
              value={data.vendor || ''}
              onChange={(e) => handleChange('vendor', e.target.value)}
            />
          </td>
          <td>
            <input
              type="text"
              className={styles.input}
              placeholder="내용"
              value={data.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </td>
        </>
      )}
      <td>
        <input
          type="text"
          className={styles.input}
          placeholder="0"
          value={data.card || ''}
          onChange={(e) => handleChange('card', e.target.value)}
        />
      </td>
      <td>
        <input
          type="text"
          className={styles.input}
          placeholder="0"
          value={data.transfer || ''}
          onChange={(e) => handleChange('transfer', e.target.value)}
        />
      </td>
      <td>
        <input
          type="text"
          className={styles.input}
          placeholder="0"
          value={data.cash || ''}
          onChange={(e) => handleChange('cash', e.target.value)}
        />
      </td>
      <td className={styles.totalAmount}>{formatCurrency(total)}</td>
      
      <td>
        <input
          type="text"
          className={styles.input}
          placeholder="메모"
          value={data.memo || ''}
          onChange={(e) => handleChange('memo', e.target.value)}
        />
      </td>
      <td>
        <button onClick={onSave} className={styles.saveButton}>
          저장
        </button>
        <button onClick={onCancel} className={styles.cancelButton}>
          취소
        </button>
      </td>
    </tr>
  )
}