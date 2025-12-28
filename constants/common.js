// 공통 상수 - 매출관리 서비스 전반에서 사용하는 상수 정의

// 임시 개발용 사용자 ID
export const TEMP_USER_ID = '00000000-0000-0000-0000-000000000000'

// 매출/지출 구분
export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
}

// 결제 수단
export const PAYMENT_METHODS = {
  CARD: 'card',
  TRANSFER: 'transfer',
  CASH: 'cash'
}

// 결제 수단 한글 표시
export const PAYMENT_METHOD_LABELS = {
  card: '카드',
  transfer: '계좌이체',
  cash: '현금'
}

// 타입 한글 표시
export const TYPE_LABELS = {
  income: '매출',
  expense: '지출'
}

// 입력 모드 (기본 / 상세)
export const INPUT_MODES = {
  BASIC: 'basic',      // 기본 컬럼만
  DETAIL: 'detail'     // 구분/거래처명/내용 포함
}

// 구분 카테고리 (예시 - 사용자가 자유롭게 입력 가능)
export const CATEGORY_EXAMPLES = [
  '렌탈료',
  '통신요금',
  '임차료',
  '전기요금',
  '수도요금',
  '가스요금',
  '급여',
  '운영비',
  '광고비',
  '재료비',
  '기타'
]

// 추가 필드 한글 표시
export const DETAIL_FIELD_LABELS = {
  category: '구분',
  vendor: '거래처명',
  description: '내용'
}