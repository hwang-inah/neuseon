// 비로그인 사용자용 데모 데이터
// 현재 날짜 기준으로 생성
const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = String(now.getMonth() + 1).padStart(2, '0')
const lastMonth = now.getMonth() === 0 
  ? { year: currentYear - 1, month: '12' }
  : { year: currentYear, month: String(now.getMonth()).padStart(2, '0') }
const twoMonthsAgo = now.getMonth() <= 1
  ? { year: currentYear - 1, month: String(12 + now.getMonth() - 1).padStart(2, '0') }
  : { year: currentYear, month: String(now.getMonth() - 1).padStart(2, '0') }

export const DEMO_SALES_DATA = [
  // 이번 달 데이터
  { id: 'demo-1', date: `${currentYear}-${currentMonth}-01`, type: 'income', amount: 1500000, memo: '매출', created_at: `${currentYear}-${currentMonth}-01` },
  { id: 'demo-2', date: `${currentYear}-${currentMonth}-05`, type: 'expense', amount: 500000, memo: '재료비', created_at: `${currentYear}-${currentMonth}-05` },
  { id: 'demo-3', date: `${currentYear}-${currentMonth}-10`, type: 'income', amount: 2000000, memo: '매출', created_at: `${currentYear}-${currentMonth}-10` },
  { id: 'demo-4', date: `${currentYear}-${currentMonth}-15`, type: 'expense', amount: 300000, memo: '인건비', created_at: `${currentYear}-${currentMonth}-15` },
  { id: 'demo-5', date: `${currentYear}-${currentMonth}-20`, type: 'income', amount: 1800000, memo: '매출', created_at: `${currentYear}-${currentMonth}-20` },
  
  // 지난달 데이터
  { id: 'demo-6', date: `${lastMonth.year}-${lastMonth.month}-05`, type: 'income', amount: 1200000, memo: '매출', created_at: `${lastMonth.year}-${lastMonth.month}-05` },
  { id: 'demo-7', date: `${lastMonth.year}-${lastMonth.month}-10`, type: 'expense', amount: 400000, memo: '재료비', created_at: `${lastMonth.year}-${lastMonth.month}-10` },
  { id: 'demo-8', date: `${lastMonth.year}-${lastMonth.month}-15`, type: 'income', amount: 1500000, memo: '매출', created_at: `${lastMonth.year}-${lastMonth.month}-15` },
  { id: 'demo-9', date: `${lastMonth.year}-${lastMonth.month}-20`, type: 'expense', amount: 250000, memo: '인건비', created_at: `${lastMonth.year}-${lastMonth.month}-20` },
  { id: 'demo-10', date: `${lastMonth.year}-${lastMonth.month}-25`, type: 'income', amount: 1600000, memo: '매출', created_at: `${lastMonth.year}-${lastMonth.month}-25` },
  
  // 2달 전 데이터
  { id: 'demo-11', date: `${twoMonthsAgo.year}-${twoMonthsAgo.month}-05`, type: 'income', amount: 1100000, memo: '매출', created_at: `${twoMonthsAgo.year}-${twoMonthsAgo.month}-05` },
  { id: 'demo-12', date: `${twoMonthsAgo.year}-${twoMonthsAgo.month}-10`, type: 'expense', amount: 350000, memo: '재료비', created_at: `${twoMonthsAgo.year}-${twoMonthsAgo.month}-10` },
  { id: 'demo-13', date: `${twoMonthsAgo.year}-${twoMonthsAgo.month}-15`, type: 'income', amount: 1400000, memo: '매출', created_at: `${twoMonthsAgo.year}-${twoMonthsAgo.month}-15` },
  { id: 'demo-14', date: `${twoMonthsAgo.year}-${twoMonthsAgo.month}-20`, type: 'expense', amount: 300000, memo: '인건비', created_at: `${twoMonthsAgo.year}-${twoMonthsAgo.month}-20` },
  { id: 'demo-15', date: `${twoMonthsAgo.year}-${twoMonthsAgo.month}-25`, type: 'income', amount: 1300000, memo: '매출', created_at: `${twoMonthsAgo.year}-${twoMonthsAgo.month}-25` },
]

export const DEMO_GOALS = [
  {
    id: 'demo-goal-1',
    type: 'monthly',
    year: currentYear,
    month: Number(currentMonth),
    target_amount: 5000000,
    created_at: `${currentYear}-${currentMonth}-01`
  },
  {
    id: 'demo-goal-2',
    type: 'annual',
    year: currentYear,
    target_amount: 50000000,
    created_at: `${currentYear}-01-01`
  }
]