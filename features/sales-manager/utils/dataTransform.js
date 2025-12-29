// 데이터 변환 유틸리티
// DB 데이터 ↔ 화면용 데이터 변환

/**
 * DB → 화면 변환
 * entry_group_id가 같은 레코드들을 1개 행으로 표시
 */
export function transformToTableData(sales) {
  if (!sales || sales.length === 0) return []

  const groups = {}
  
  // entry_group_id로 그룹화
  sales.forEach(sale => {
    // entry_group_id가 없는 레코드는 개별 ID 사용 (기존 데이터 처리)
    const groupId = sale.entry_group_id || `single_${sale.id}`
    
    if (!groups[groupId]) {
      groups[groupId] = {
        rowId: groupId,
        date: sale.date,
        category: sale.category || '',
        vendor: sale.vendor || '',
        description: sale.description || '',
        memo: sale.memo || '',
        card: 0,
        transfer: 0,
        cash: 0,
        ids: { card: null, transfer: null, cash: null },
        allIds: []
      }
    }
    
    // 결제수단별 금액과 ID 설정
    groups[groupId][sale.payment_method] = sale.amount
    groups[groupId].ids[sale.payment_method] = sale.id
    groups[groupId].allIds.push(sale.id)
  })
  
  // 배열로 변환 후 날짜 내림차순 정렬
  return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * 화면 → DB 변환
 * 1개 행을 여러 DB 레코드로 분리 (결제수단별)
 */
export function transformToSalesData(tableRow, type) {
  const sales = []
  const groupId = crypto.randomUUID() // 같은 입력 세션 식별용
  
  const common = {
    date: tableRow.date,
    type: type,
    category: tableRow.category || null,
    vendor: tableRow.vendor || null,
    description: tableRow.description || null,
    memo: tableRow.memo || '',
    entry_group_id: groupId
  }

  if (tableRow.card > 0) {
    sales.push({ ...common, payment_method: 'card', amount: tableRow.card })
  }

  if (tableRow.transfer > 0) {
    sales.push({ ...common, payment_method: 'transfer', amount: tableRow.transfer })
  }

  if (tableRow.cash > 0) {
    sales.push({ ...common, payment_method: 'cash', amount: tableRow.cash })
  }

  return sales
}