// 증감률 계산

// 증감률 계산
export function calculateGrowthRate(current, previous) {
  if (!previous || previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
}

// 기간별 합계 계산
// 안전 처리: amount가 문자열이거나 null/undefined인 경우도 처리
export function calculateSum(sales, type = null) {
  if (!sales || sales.length === 0) return 0
  
  return sales
    .filter(sale => type === null || sale.type === type)
    .reduce((sum, sale) => {
      const amount = Number(sale?.amount) || 0
      return sum + amount
    }, 0)
}

// 순익 계산
export function calculateProfit(sales) {
  const income = calculateSum(sales, 'income')
  const expense = calculateSum(sales, 'expense')
  return income - expense
}

// 목표 달성률 계산
export function calculateGoalProgress(current, goal) {
  if (!goal || goal === 0) return 0
  return Math.round((current / goal) * 100)
}