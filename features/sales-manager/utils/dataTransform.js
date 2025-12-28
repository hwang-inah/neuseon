// 데이터 변환 유틸리티
// DB 데이터 ↔ 화면용 데이터 변환 담당

// DB 데이터 → 화면용 데이터 변환 (날짜별 그룹화)
export function transformToTableData(sales) {
  const grouped = {}

  sales.forEach(sale => {
    if (!grouped[sale.date]) {
      grouped[sale.date] = {
        date: sale.date,
        card: 0,
        transfer: 0,
        cash: 0,
        memo: '',
        category: '',
        vendor: '',
        description: '',
        ids: {
          card: null,
          transfer: null,
          cash: null
        },
        allIds: [] // 모든 id 저장 (삭제/수정용)
      }
    }

    // 금액 설정
    grouped[sale.date][sale.payment_method] = sale.amount
    grouped[sale.date].ids[sale.payment_method] = sale.id
    grouped[sale.date].allIds.push(sale.id)
    
    // 추가 필드 설정 (가장 최근 값 사용)
    if (sale.category) grouped[sale.date].category = sale.category
    if (sale.vendor) grouped[sale.date].vendor = sale.vendor
    if (sale.description) grouped[sale.date].description = sale.description
    
    // 메모 합치기
    if (sale.memo) {
      if (grouped[sale.date].memo) {
        grouped[sale.date].memo += ` / ${sale.memo}`
      } else {
        grouped[sale.date].memo = sale.memo
      }
    }
  })

  return Object.values(grouped).sort((a, b) => b.date.localeCompare(a.date))
}

// 화면용 데이터 → DB 저장용 데이터 변환
export function transformToSalesData(tableRow, type) {
  const sales = []
  
  // 공통 필드 (추가 필드 포함)
  const commonFields = {
    date: tableRow.date,
    type: type,
    memo: tableRow.memo || '',
    category: tableRow.category || null,
    vendor: tableRow.vendor || null,
    description: tableRow.description || null
  }

  // 카드 금액이 있으면 추가
  if (tableRow.card > 0) {
    sales.push({
      ...commonFields,
      amount: tableRow.card,
      payment_method: 'card'
    })
  }

  // 계좌이체 금액이 있으면 추가
  if (tableRow.transfer > 0) {
    sales.push({
      ...commonFields,
      amount: tableRow.transfer,
      payment_method: 'transfer'
    })
  }

  // 현금 금액이 있으면 추가
  if (tableRow.cash > 0) {
    sales.push({
      ...commonFields,
      amount: tableRow.cash,
      payment_method: 'cash'
    })
  }

  return sales
}