// 금액 포맷

// 금액 포맷 (3자리 콤마)
export function formatCurrency(amount) {
  if (amount === null || amount === undefined) return '0원'
  return `${Number(amount).toLocaleString()}원`
}

// 숫자만 추출 (입력 시 사용)
export function parseNumber(value) {
  if (!value) return 0
  return Number(String(value).replace(/[^0-9]/g, ''))
}

// 증감 표시 (+/- 기호)
export function formatGrowth(value) {
  if (value === 0) return '0%'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value}%`
}