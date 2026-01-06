// 디버그 로그 유틸리티
// NEXT_PUBLIC_DEBUG 환경변수가 'true'일 때만 로그 출력

const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG === 'true'

export function debugLog(...args) {
  if (DEBUG_ENABLED) {
    console.log(...args)
  }
}

export function debugError(...args) {
  if (DEBUG_ENABLED) {
    console.error(...args)
  }
}
