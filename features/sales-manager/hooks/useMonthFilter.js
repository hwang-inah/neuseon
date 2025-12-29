// 월별 필터링 관리 훅
// 연도/월 선택, 사용 가능한 기간 추출 로직

import { useState, useEffect } from 'react'

export function useMonthFilter(data, isInitialLoad = true) {
  const [selectedMonth, setSelectedMonth] = useState(null)
  const [availableMonths, setAvailableMonths] = useState({})
  const [expandedYear, setExpandedYear] = useState(null)

  // 사용 가능한 월 추출 및 자동 선택
  useEffect(() => {
    if (!data || data.length === 0) {
      setAvailableMonths({})
      return
    }

    const months = extractMonthsFromData(data)
    setAvailableMonths(months)

    // 최신 월 자동 선택 로직
    if (isInitialLoad && Object.keys(months).length > 0) {
      selectLatestMonth(months)
    } else if (selectedMonth) {
      // 선택된 월이 여전히 유효한지 확인
      validateSelectedMonth(months)
    } else if (Object.keys(months).length > 0) {
      selectLatestMonth(months)
    }
  }, [data])

  // 데이터에서 연도/월 추출
  const extractMonthsFromData = (data) => {
    const months = {}
    
    data.forEach(row => {
      const [year, month] = row.date.split('-')
      if (!months[year]) {
        months[year] = new Set()
      }
      months[year].add(month)
    })

    // Set을 배열로 변환하고 내림차순 정렬
    const sortedMonths = {}
    Object.keys(months).sort().forEach(year => {
      sortedMonths[year] = Array.from(months[year]).sort((a, b) => b.localeCompare(a))
    })

    return sortedMonths
  }

  // 최신 월 선택
  const selectLatestMonth = (months) => {
    const latestYear = Object.keys(months).sort().reverse()[0]
    const latestMonth = months[latestYear][0]
    
    if (latestMonth) {
      setSelectedMonth(`${latestYear}-${latestMonth}`)
      setExpandedYear(latestYear)
    }
  }

  // 선택된 월 유효성 검사
  const validateSelectedMonth = (months) => {
    const [year, month] = selectedMonth.split('-')
    
    if (!months[year] || !months[year].includes(month)) {
      selectLatestMonth(months)
    }
  }

  // 연도 클릭 핸들러
  const handleYearClick = (year) => {
    if (expandedYear === year) {
      setExpandedYear(null)
    } else {
      setExpandedYear(year)
      const firstMonth = availableMonths[year][0]
      setSelectedMonth(`${year}-${firstMonth}`)
    }
  }

  // 월 선택 핸들러
  const handleMonthSelect = (month) => {
    setSelectedMonth(month)
  }

  // 필터링된 데이터 반환
  const getFilteredData = (allData) => {
    if (!selectedMonth) return allData
    return allData.filter(row => row.date.startsWith(selectedMonth))
  }

  return {
    selectedMonth,
    availableMonths,
    expandedYear,
    handleYearClick,
    handleMonthSelect,
    getFilteredData,
    setSelectedMonth,
    setExpandedYear
  }
}