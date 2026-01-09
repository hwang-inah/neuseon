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

// 현재 날짜 정보 (년, 월, 지난달 정보)
// 여러 컴포넌트에서 동일한 로직이 중복되어 있음
export function getCurrentDateInfo(date = new Date()) {
  const now = new Date(date)
  const currentYear = now.getFullYear()
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
  const lastMonth = now.getMonth() === 0 
    ? { year: currentYear - 1, month: '12' }
    : { year: currentYear, month: String(now.getMonth()).padStart(2, '0') }
  
  return {
    currentYear,
    currentMonth,
    lastMonth
  }
}

// 현재 연도
export function getCurrentYear(date = new Date()) {
  return new Date(date).getFullYear()
}

// 현재 월 (1-12 숫자)
export function getCurrentMonth(date = new Date()) {
  return new Date(date).getMonth() + 1
}

// 날짜 문자열 파싱 (YYYY-MM-DD 형식)
// 여러 컴포넌트에서 date.split('-') 패턴이 중복되어 있음
export function parseDate(dateString) {
  if (!dateString) return { year: null, month: null, day: null }
  
  const parts = dateString.split('-')
  return {
    year: parts[0] || null,
    month: parts[1] || null,
    day: parts[2] || null
  }
}

// 날짜 문자열을 숫자로 파싱 (YYYY-MM-DD 형식)
export function parseDateAsNumbers(dateString) {
  if (!dateString) return { year: null, month: null, day: null }
  
  const parts = dateString.split('-').map(Number)
  return {
    year: parts[0] || null,
    month: parts[1] || null,
    day: parts[2] || null
  }
}