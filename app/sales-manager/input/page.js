// 입력 페이지

'use client'

import { useState, useEffect } from 'react'
import { useSalesData } from '@/features/sales-manager/hooks/useSalesData'
import { useConfirm } from '@/features/sales-manager/hooks/useConfirm'
import ConfirmModal from '@/features/sales-manager/components/ConfirmModal'
import SalesTable from './components/SalesTable'
import { transformToTableData, transformToSalesData } from '@/features/sales-manager/utils/dataTransform'
import { parseFileToSalesData, downloadCSV, downloadExcel } from '@/features/sales-manager/utils/fileParser' // 이 줄 수정!
import { formatCurrency, parseNumber } from '@/shared/utils/formatUtils'
import { TYPE_LABELS } from '@/constants/common'
import styles from './page.module.css'


export default function InputPage() {
  const { sales, loading, addSale, addSales, deleteSales } = useSalesData()
  const { isOpen, config, confirm, handleConfirm, handleCancel } = useConfirm()

  const [activeTab, setActiveTab] = useState('income')
  const [incomeData, setIncomeData] = useState([])
  const [expenseData, setExpenseData] = useState([])
  const [showDetailFields, setShowDetailFields] = useState(false) // 상세 입력 모드 상태 추가
  
  // 월별 필터
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [availableMonths, setAvailableMonths] = useState({})
  const [expandedYear, setExpandedYear] = useState(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true) // 초기 로드 플래그
  const [isSaving, setIsSaving] = useState(false)


  // 완전 중복 체크 함수 (상단에 위치)
  const isDuplicate = (newRow, existingRow) => {
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

  // 탭 클릭 핸들러 추가
  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    setExpandedYear(null) // 탭 전환 시 펼친 연도 초기화
    setIsInitialLoad(true) // 새 탭의 최신 월 자동 선택
  }

  // 데이터 변환 및 월 추출
  useEffect(() => {
    console.log('useEffect 실행, sales 개수:', sales?.length || 0)
    
    if (sales && sales.length > 0) {
      const incomeSales = sales.filter(s => s.type === 'income')
      const expenseSales = sales.filter(s => s.type === 'expense')
      
      console.log('매출 개수:', incomeSales.length, '지출 개수:', expenseSales.length)
      
      const incomeTableData = transformToTableData(incomeSales)
      const expenseTableData = transformToTableData(expenseSales)
      
      console.log('변환된 매출 데이터:', incomeTableData.length)
      
      setIncomeData(incomeTableData)
      setExpenseData(expenseTableData)

      // 현재 탭의 데이터에서 월 추출
      const currentData = activeTab === 'income' ? incomeTableData : expenseTableData
      extractAvailableMonths(currentData)
    }
  }, [sales, activeTab])

  // 사용 가능한 월 추출
  const extractAvailableMonths = (data) => {
    const months = {}
    
    data.forEach(row => {
      const [year, month] = row.date.split('-')
      if (!months[year]) {
        months[year] = new Set()
      }
      months[year].add(month)
    })

    // Set을 배열로 변환하고 정렬
    const sortedMonths = {}
    Object.keys(months).sort().forEach(year => {
      // 월을 내림차순으로 정렬 (12월 → 1월)
      sortedMonths[year] = Array.from(months[year]).sort((a, b) => b.localeCompare(a))
    })

    setAvailableMonths(sortedMonths)

    // 초기 로드일 때만 최신 월 자동 선택
    if (isInitialLoad && Object.keys(sortedMonths).length > 0) {
      const latestYear = Object.keys(sortedMonths).sort().reverse()[0]
      const latestMonth = sortedMonths[latestYear]?.[0] // 안전 접근 추가. 이미 내림차순 정렬되어 있으므로 첫 번째가 최신
      
      if (latestMonth) {
        setSelectedMonth(`${latestYear}-${latestMonth}`)
        setExpandedYear(latestYear)
        setIsInitialLoad(false) // 초기 로드 완료
      }
    } else if (selectedMonth) {
      // 이미 선택된 월이 있으면 유지 (단, 해당 월이 여전히 존재하는지 확인)
      const [year, month] = selectedMonth.split('-')
      if (!sortedMonths[year] || !sortedMonths[year].includes(month)) {
        // 선택된 월이 더 이상 존재하지 않으면 최신 월로
        if (Object.keys(sortedMonths).length > 0) {
          const latestYear = Object.keys(sortedMonths).sort().reverse()[0]
          const latestMonth = sortedMonths[latestYear]?.[0] // 안전 접근 추가
          
          if (latestMonth) {
            setSelectedMonth(`${latestYear}-${latestMonth}`)
            setExpandedYear(latestYear)
          }
        }
      }
    } else if (Object.keys(sortedMonths).length > 0) {
      // 선택된 월이 없으면 최신 월로
      const latestYear = Object.keys(sortedMonths).sort().reverse()[0]
      const latestMonth = sortedMonths[latestYear]?.[0] // 안전 접근 추가
      
      if (latestMonth) {
        setSelectedMonth(`${latestYear}-${latestMonth}`)
        setExpandedYear(latestYear)
      }
    }
  }

  // 연도 클릭
  const handleYearClick = (year) => {
    if (expandedYear === year) {
      setExpandedYear(null)
    } else {
      setExpandedYear(year)
      // 해당 연도의 첫 번째 월 선택
      const firstMonth = availableMonths[year][0]
      setSelectedMonth(`${year}-${firstMonth}`)
    }
  }

  // 선택한 월의 데이터만 필터링
  const currentData = activeTab === 'income' ? incomeData : expenseData
  const filteredData = selectedMonth 
    ? currentData.filter(row => row.date.startsWith(selectedMonth))
    : currentData

  console.log('현재 탭:', activeTab)
  console.log('선택된 월:', selectedMonth)
  console.log('전체 데이터:', currentData)
  console.log('필터링된 데이터:', filteredData)

  // 저장 (추가 또는 수정)
  const handleSave = async (tableRow, originalRow) => {
    console.log('=== handleSave 시작 ===')
    console.log('tableRow:', tableRow)
    console.log('originalRow:', originalRow)
    console.log('isEdit:', originalRow !== null)

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
      const allData = activeTab === 'income' ? incomeData : expenseData
      const hasDuplicate = allData.some(existingRow => isDuplicate(tableRow, existingRow))

      console.log('중복 체크:', hasDuplicate)
      console.log('입력 데이터:', tableRow)
      console.log('전체 데이터 개수:', allData.length)

      if (hasDuplicate) {
        const duplicateResult = await confirm({
          title: '⚠️ 중복 데이터',
          message: '완전히 동일한 데이터가 이미 존재합니다.\n\n그래도 추가하시겠습니까?',
          type: 'create',
          confirmText: '추가',
          cancelText: '취소'
        })

        console.log('중복 확인 결과:', duplicateResult)

        if (!duplicateResult) return
      }
    }

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
        // 수정: 해당 날짜의 모든 데이터 삭제
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

    // 모든 ID 사용
    const idsToDelete = tableRow.allIds || Object.values(tableRow.ids).filter(Boolean)
    
    if (idsToDelete.length > 0) {
      const response = await deleteSales(idsToDelete)
      if (!response.success) {
        alert('삭제 실패: ' + response.error)
      }
    }
  }

  // 파일 업로드
  const handleFileUpload = async (file) => {
  try {
    const salesData = await parseFileToSalesData(file)
    
    if (salesData.length === 0) {
      alert('유효한 데이터가 없습니다')
      return
    }

    // 중복 검사
    const currentData = activeTab === 'income' ? incomeData : expenseData
    const duplicates = []
    const nonDuplicates = []

    salesData.forEach(newRow => {
      const hasDuplicate = currentData.some(existingRow => isDuplicate(newRow, existingRow))
      
      if (hasDuplicate) {
        duplicates.push(newRow)
      } else {
        nonDuplicates.push(newRow)
      }
    })

    // 중복 데이터 처리
    let finalData = [...nonDuplicates]
    
    if (duplicates.length > 0) {
      const duplicateResult = await confirm({
        title: '⚠️ 중복 데이터 발견',
        message: `${duplicates.length}개의 완전히 동일한 데이터가 이미 존재합니다.\n\n중복 데이터도 추가하시겠습니까?`,
        type: 'create',
        confirmText: '추가',
        cancelText: '건너뛰기'
      })

      if (duplicateResult) {
        finalData = [...finalData, ...duplicates]
      }
    }

    if (finalData.length === 0) {
      alert('추가할 데이터가 없습니다')
      return
    }

    // 최종 확인
    const result = await confirm({
      title: '파일 업로드 확인',
      message: `${finalData.length}개의 데이터를 추가하시겠습니까?`,
      type: 'create',
      confirmText: '추가'
    })

    if (!result) return

    setIsSaving(true)

    try {
      const allSales = []
      finalData.forEach(row => {
        const converted = transformToSalesData(row, activeTab)
        allSales.push(...converted)
      })

      const response = await addSales(allSales)
      
      if (response.success) {
        // 업로드된 데이터의 가장 최근 월로 이동
        const dates = finalData.map(d => String(d.date)).filter(Boolean).sort().reverse()
        if (dates.length > 0) {
          const latestDate = dates[0]
          const [year, month] = latestDate.split('-')
          if (year && month) {
            setIsInitialLoad(false)
            setSelectedMonth(`${year}-${month}`)
            setExpandedYear(year)
          }
        }
        
        let message = `${finalData.length}개 항목이 추가되었습니다`
        if (duplicates.length > 0 && finalData.length < salesData.length) {
          message += `\n(중복 ${duplicates.length}개 건너뜀)`
        }
        alert(message)
      } else {
        alert('업로드 실패: ' + response.error)
      }
    } catch (error) {
      console.error('업로드 에러:', error)
      alert('업로드 실패: ' + error.message)
    } finally {
      setTimeout(() => {
        setIsSaving(false)
      }, 300)
    }
  } catch (error) {
    console.error('파일 처리 실패:', error)
    alert('파일 처리 실패: ' + error.message)
    setIsSaving(false)
  }
}
  
  // 파일 다운로드 (이 부분 추가!)
  const handleDownload = () => {
    if (filteredData.length === 0) {
      alert('다운로드할 데이터가 없습니다')
      return
    }

    const filename = `${activeTab === 'income' ? '매출' : '지출'}_${selectedMonth || 'all'}.csv`
    downloadCSV(filteredData, filename)
  }

  // CSV 다운로드
  const handleDownloadCSV = () => {
    if (filteredData.length === 0) {
      alert('다운로드할 데이터가 없습니다')
      return
    }

    const filename = `${activeTab === 'income' ? '매출' : '지출'}_${selectedMonth || 'all'}.csv`
    downloadCSV(filteredData, filename)
  }

  // 엑셀 다운로드
  const handleDownloadExcel = () => {
    if (filteredData.length === 0) {
      alert('다운로드할 데이터가 없습니다')
      return
    }

    const filename = `${activeTab === 'income' ? '매출' : '지출'}_${selectedMonth || 'all'}.xlsx`
    downloadExcel(filteredData, filename)
  }



  if (loading) {
    return <div className={styles.container}>로딩 중...</div>
  }

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
      {Object.keys(availableMonths).length > 0 && (
        <div className={styles.monthFilter}>
          {/* 연도 버튼들 */}
          <div className={styles.yearButtons}>
            {Object.keys(availableMonths).sort().reverse().map(year => (
              <button
                key={year}
                className={`${styles.yearButton} ${expandedYear === year ? styles.yearButtonActive : ''}`}
                onClick={() => handleYearClick(year)}
              >
                {year}년 {expandedYear === year ? '▼' : ''}
              </button>
            ))}
          </div>

          {/* 펼쳐진 연도의 월 버튼들 */}
          {expandedYear && availableMonths[expandedYear] && (
            <div className={styles.monthButtons}>
              {availableMonths[expandedYear].map(month => {
                const monthKey = `${expandedYear}-${month}`
                const monthNumber = parseInt(month, 10)
                return (
                  <button
                    key={monthKey}
                    className={`${styles.monthButton} ${selectedMonth === monthKey ? styles.monthButtonActive : ''}`}
                    onClick={() => setSelectedMonth(monthKey)}
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
          onDownloadCSV={handleDownloadCSV}
          onDownloadExcel={handleDownloadExcel}
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