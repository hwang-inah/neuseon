// 대화정리 서비스 스키마 상수 정의
// 입력/출력 스키마에 사용되는 enum 값들

// 관계 타입
export const RELATIONSHIP_TYPES = {
  COLLEAGUE: 'colleague',      // 동료
  FRIEND: 'friend',            // 친구
  FAMILY: 'family',            // 가족
  CLIENT: 'client',            // 고객
  PARTNER: 'partner',          // 파트너/협력사
  OTHER: 'other'               // 기타
}

// 관계 타입 허용 값 배열
export const RELATIONSHIP_TYPE_VALUES = [
  'colleague',
  'friend',
  'family',
  'client',
  'partner',
  'other'
]

// 사용자 의도
export const USER_GOALS = {
  REDUCE_MISUNDERSTANDING: 'reduce-misunderstanding',  // 오해 해소
  APOLOGIZE: 'apologize',                              // 사과 전달
  EXPRESS_NEEDS: 'express-needs',                      // 필요/요구사항 표현
  SET_BOUNDARIES: 'set-boundaries',                    // 경계 설정
  CLOSE_CONVERSATION: 'close-conversation',            // 대화 마무리
  UNDERSTAND_MY_FEELINGS: 'understand-my-feelings'     // 내 감정 전달/이해 요청
}

// 사용자 의도 허용 값 배열
export const USER_GOAL_VALUES = [
  'reduce-misunderstanding',
  'apologize',
  'express-needs',
  'set-boundaries',
  'close-conversation',
  'understand-my-feelings'
]

// 톤 기준선
export const TONE_BASELINES = {
  FORMAL: 'formal',              // 격식 있는
  CASUAL: 'casual',              // 캐주얼
  PROFESSIONAL: 'professional',   // 전문적
  FRIENDLY: 'friendly',          // 친근한
  NEUTRAL: 'neutral',            // 중립적
  UNKNOWN: 'unknown'             // 미지정 (기본값)
}

// 톤 기준선 허용 값 배열
export const TONE_BASELINE_VALUES = [
  'formal',
  'casual',
  'professional',
  'friendly',
  'neutral',
  'unknown'
]
