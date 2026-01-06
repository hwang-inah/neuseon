// 대화정리 서비스 에러 메시지 상수 정의
// route.js에서 공통으로 사용하는 에러 응답 포맷

export const TALK_ERRORS = {
  MISSING_FIELD: (field) => ({
    error: `필수 필드가 누락되었습니다: ${field}`,
    field,
    code: 'MISSING_FIELD'
  }),

  INVALID_VALUE: (field, message) => ({
    error: message,
    field,
    code: 'INVALID_VALUE'
  }),

  INVALID_ENUM: (field, value) => ({
    error: `허용되지 않은 값입니다: ${value}`,
    field,
    code: 'INVALID_ENUM'
  }),

  PARSE_ERROR: {
    error: '요청 바디 파싱 실패',
    code: 'PARSE_ERROR'
  },

  SCHEMA_VALIDATION_ERROR: {
    error: '응답 스키마 검증 실패',
    code: 'SCHEMA_VALIDATION_ERROR'
  },

  INTERNAL_ERROR: {
    error: '분석 처리 중 오류가 발생했습니다',
    code: 'INTERNAL_ERROR'
  }
}