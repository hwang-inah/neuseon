// 입력 페이지 - Client Component

'use client'

import { useState, useEffect } from 'react'
import { useSalesData } from '@/features/sales-manager/hooks/useSalesData'
import { useConfirm } from '@/features/sales-manager/hooks/useConfirm'
import { useMonthFilter } from '@/features/sales-manager/hooks/useMonthFilter'
import { useSalesInput } from '@/features/sales-manager/hooks/useSalesInput'
import { useFileUpload } from '@/features/sales-manager/hooks/useFileUpload'
import { useToast } from '@/shared/hooks/useToast'
import { useDraftSave } from '@/features/sales-manager/hooks/useDraftSave'
import Toast from '@/shared/components/Toast'
import DraftBanner from '@/features/sales-manager/components/DraftBanner'
import ConfirmModal from '@/features/sales-manager/components/ConfirmModal'
import SalesTable from './components/SalesTable'
import BulkInputModal from './components/BulkInputModal'
import { transformToTableData } from '@/features/sales-manager/utils/dataTransform'
import { debugError } from '@/shared/utils/debug'
import styles from './page.module.css'

export default function InputClient() {
  const { sales, loading, addSales, deleteSales } = useSalesData()
  const { isOpen, config, confirm, handleConfirm, handleCancel } = useConfirm()
  const { toast, showSuccess, showError, showInfo, hideToast } = useToast()
  const { hasDraft, saveDraft, clearDraft, dismissDraft } = useDraftSave()

  const [activeTab, setActiveTab] = useState('income')
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [incomeData, setIncomeData] = useState([])
  const [expenseData, setExpenseData] = useState([])
  const [showDetailFields, setShowDetailFields] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // 데이터 변환
  useEffect(() => {
    if (sales) {
      const incomeSales = sales.filter(s => s.type === 'income')
      const expenseSales = sales.filter(s => s.type === 'expense')
      
      setIncomeData(transformToTableData(incomeSales))
      setExpenseData(transformToTableData(expenseSales))
    }
  }, [sales])

  // 현재 탭 데이터
  const currentData = activeTab === 'income' ? incomeData : expenseData

  // 월별 필터링 훅
  const monthFilter = useMonthFilter(currentData, isInitialLoad)

  // 탭 변경 시 초기화
  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    monthFilter.setExpandedYear(null)
    setIsInitialLoad(true)
  }

  // 초기 로드 완료 처리
  useEffect(() => {
    if (isInitialLoad && monthFilter.selectedMonth) {
      setIsInitialLoad(false)
    }
  }, [monthFilter.selectedMonth])

  // 저장/삭제 훅
  const filteredData = monthFilter.getFilteredData(currentData)
  const { handleSave, handleDelete, handleDeleteAll, isSaving } = useSalesInput({
    activeTab,
    currentData: filteredData, // 필터링된 데이터 전달
    addSales,
    deleteSales,
    confirm,
    showSuccess,
    showError
  })

  // 파일 업로드 훅
  const { handleFileUpload } = useFileUpload({
    activeTab,
    currentData,
    addSales,
    confirm,
    onUploadSuccess: (latestMonth) => {
      if (latestMonth) {
        setIsInitialLoad(false)
        monthFilter.setSelectedMonth(`${latestMonth.year}-${latestMonth.month}`)
        monthFilter.setExpandedYear(latestMonth.year)
      }
    }
  })

  // 다중 입력 저장
  const handleBulkSave = async (rows) => {
    try {
      const salesData = rows.flatMap(row => {
        const items = []
        
        if (parseFloat(row.card) > 0) {
          items.push({
            date: row.date,
            type: activeTab,
            payment_method: 'card',
            amount: parseFloat(row.card),
            memo: row.memo || null
          })
        }
        
        if (parseFloat(row.transfer) > 0) {
          items.push({
            date: row.date,
            type: activeTab,
            payment_method: 'transfer',
            amount: parseFloat(row.transfer),
            memo: row.memo || null
          })
        }
        
        if (parseFloat(row.cash) > 0) {
          items.push({
            date: row.date,
            type: activeTab,
            payment_method: 'cash',
            amount: parseFloat(row.cash),
            memo: row.memo || null
          })
        }
        
        return items
      })

      const response = await addSales(salesData)
      
      if (response.success) {
        showSuccess(`${salesData.length}개 항목이 저장되었습니다`)
        setShowBulkModal(false)
      } else {
        showError('저장 실패: ' + response.error)
      }
    } catch (error) {
      showError('저장 중 오류가 발생했습니다')
      debugError('Bulk save error:', error)
    }
  }

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>
  }

  return (
    <div className={styles.container}>
      {/* 토스트 알림 */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={hideToast} 
        />
      )}

      <h1 className={styles.title}>입력하기</h1>

      {/* 임시저장 알림 */}
      {hasDraft && (
        <DraftBanner
          onRestore={() => {
            showSuccess('임시저장 데이터를 불러왔습니다')
            // TODO: 테이블에 데이터 복원 로직 추가
            dismissDraft()
          }}
          onDismiss={() => {
            clearDraft()
            showInfo('임시저장 데이터를 삭제했습니다')
          }}
        />
      )}

      {/* 탭 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'income' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('income')}
        >
          매출
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'expense' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('expense')}
        >
          지출
        </button>
      </div>

      {/* 월별 필터 */}
      {Object.keys(monthFilter.availableMonths).length > 0 && (
        <div className={styles.monthFilter}>
          <div className={styles.yearButtons}>
            {Object.keys(monthFilter.availableMonths).sort().reverse().map(year => (
              <button
                key={year}
                className={`${styles.yearButton} ${monthFilter.expandedYear === year ? styles.yearButtonActive : ''}`}
                onClick={() => monthFilter.handleYearClick(year)}
              >
                {year}년 {monthFilter.expandedYear === year ? '▼' : ''}
              </button>
            ))}
          </div>

          {monthFilter.expandedYear && monthFilter.availableMonths[monthFilter.expandedYear] && (
            <div className={styles.monthButtons}>
              {monthFilter.availableMonths[monthFilter.expandedYear].map(month => {
                const monthKey = `${monthFilter.expandedYear}-${month}`
                const monthNumber = parseInt(month, 10)
                return (
                  <button
                    key={monthKey}
                    className={`${styles.monthButton} ${monthFilter.selectedMonth === monthKey ? styles.monthButtonActive : ''}`}
                    onClick={() => monthFilter.handleMonthSelect(monthKey)}
                  >
                    {monthNumber}월
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 상세 입력 모드 토글 */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setShowDetailFields(!showDetailFields)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: showDetailFields ? '#8B7355' : '#fff',
            color: showDetailFields ? '#fff' : '#666',
            border: '1px solid #8B7355',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {showDetailFields ? '기본 입력 모드' : '상세 입력 모드'}
        </button>
      </div>

      {/* 테이블 */}
      <div className={styles.section} style={{ opacity: isSaving ? 0.6 : 1, transition: 'opacity 0.3s' }}>
        <SalesTable
          data={filteredData}
          type={activeTab}
          selectedMonth={monthFilter.selectedMonth}
          onSave={handleSave}
          onDelete={handleDelete}
          onDeleteAll={handleDeleteAll}
          onBulkInput={() => setShowBulkModal(true)}
          onFileUpload={handleFileUpload}
          showDetailFields={showDetailFields}
        />
      </div>

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={isOpen}
        config={config}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      {/* 다중 입력 모달 */}
      {showBulkModal && (
        <BulkInputModal
          type={activeTab}
          onClose={() => setShowBulkModal(false)}
          onSave={handleBulkSave}
        />
      )}
    </div>
  )
}
