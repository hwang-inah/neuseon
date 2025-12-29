// 입력 페이지

'use client'

import { useState, useEffect } from 'react'
import { useSalesData } from '@/features/sales-manager/hooks/useSalesData'
import { useConfirm } from '@/features/sales-manager/hooks/useConfirm'
import { useMonthFilter } from '@/features/sales-manager/hooks/useMonthFilter'
import { useSalesInput } from '@/features/sales-manager/hooks/useSalesInput'
import { useFileUpload } from '@/features/sales-manager/hooks/useFileUpload'
import ConfirmModal from '@/features/sales-manager/components/ConfirmModal'
import SalesTable from './components/SalesTable'
import { transformToTableData } from '@/features/sales-manager/utils/dataTransform'
// import { downloadCSV, downloadExcel } from '@/features/sales-manager/utils/fileParser'
import styles from './page.module.css'

export default function InputPage() {
  const { sales, loading, addSales, deleteSales } = useSalesData()
  const { isOpen, config, confirm, handleConfirm, handleCancel } = useConfirm()

  const [activeTab, setActiveTab] = useState('income')
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
  const { handleSave, handleDelete, isSaving } = useSalesInput({
    activeTab,
    currentData,
    addSales,
    deleteSales,
    confirm
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

  // 다운로드 핸들러
  // const handleDownloadCSV = () => {
  //   const filteredData = monthFilter.getFilteredData(currentData)
  //   if (filteredData.length === 0) {
  //     alert('다운로드할 데이터가 없습니다')
  //     return
  //   }
  //   const filename = `${activeTab === 'income' ? '매출' : '지출'}_${monthFilter.selectedMonth || 'all'}.csv`
  //   downloadCSV(filteredData, filename)
  // }

  // const handleDownloadExcel = () => {
  //   const filteredData = monthFilter.getFilteredData(currentData)
  //   if (filteredData.length === 0) {
  //     alert('다운로드할 데이터가 없습니다')
  //     return
  //   }
  //   const filename = `${activeTab === 'income' ? '매출' : '지출'}_${monthFilter.selectedMonth || 'all'}.xlsx`
  //   downloadExcel(filteredData, filename)
  // }

  if (loading) {
    return <div className={styles.container}>로딩 중...</div>
  }

  const filteredData = monthFilter.getFilteredData(currentData)

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>입력하기</h1>

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
          onSave={handleSave}
          onDelete={handleDelete}
          onFileUpload={handleFileUpload}
          // onDownloadCSV={handleDownloadCSV}
          // onDownloadExcel={handleDownloadExcel}
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
    </div>
  )
}