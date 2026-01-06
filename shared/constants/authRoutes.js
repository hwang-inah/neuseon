// 인증 관련 라우트 상수
// 보호 경로 정책을 변경할 때는 이 파일만 수정하면 됩니다.

/**
 * 보호 경로 prefix 목록 (로그인 필요)
 * 
 * 각 경로는 prefix로 사용되며, 하위 경로까지 포함됩니다.
 * 예: '/sales-manager/input'은 '/sales-manager/input'과 '/sales-manager/input/sub-page' 모두 보호합니다.
 */
export const PROTECTED_PATH_PREFIXES = [
  '/sales-manager/input',
  '/sales-manager/compare',
  '/sales-manager/goals'
  // 대화정리 서비스가 보호 페이지가 되면 아래 주석을 해제하세요:
  // '/talk'
]

/**
 * 주어진 경로가 보호 경로인지 확인
 * 
 * @param {string} pathname - 확인할 경로 (예: '/sales-manager/input')
 * @returns {boolean} 보호 경로이면 true, 아니면 false
 * 
 * @example
 * isProtectedPath('/sales-manager/input') // true
 * isProtectedPath('/sales-manager/input/sub') // true
 * isProtectedPath('/sales-manager') // false
 * isProtectedPath('/') // false
 */
export function isProtectedPath(pathname) {
  if (!pathname || typeof pathname !== 'string') {
    return false
  }
  
  return PROTECTED_PATH_PREFIXES.some(prefix => 
    pathname === prefix || pathname.startsWith(prefix + '/')
  )
}
