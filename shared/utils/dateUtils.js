// 날짜 포맷

// 날짜 포맷 (YYYY-MM-DD)
export function formatDate(date) {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 오늘 날짜
export function getToday() {
  return formatDate(new Date())
}

// 월의 첫날
export function getMonthStart(date = new Date()) {
  const d = new Date(date)
  return formatDate(new Date(d.getFullYear(), d.getMonth(), 1))
}

// 월의 마지막날
export function getMonthEnd(date = new Date()) {
  const d = new Date(date)
  return formatDate(new Date(d.getFullYear(), d.getMonth() + 1, 0))
}

// 주의 첫날 (월요일)
export function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return formatDate(new Date(d.setDate(diff)))
}

// 주의 마지막날 (일요일)
export function getWeekEnd(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? 0 : 7)
  return formatDate(new Date(d.setDate(diff)))
}

// 년도의 첫날
export function getYearStart(date = new Date()) {
  const d = new Date(date)
  return formatDate(new Date(d.getFullYear(), 0, 1))
}

// 년도의 마지막날
export function getYearEnd(date = new Date()) {
  const d = new Date(date)
  return formatDate(new Date(d.getFullYear(), 11, 31))
}