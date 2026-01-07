// 인증 관련 라우트 상수
// 보호 경로 정책을 변경할 때는 이 파일만 수정하면 됩니다.

/**
 * 보호 경로 prefix 목록 (로그인 필요)
 * 
 * 각 경로는 prefix로 사용되며, 하위 경로까지 포함됩니다.
 * 예: '/sales-manager'는 '/sales-manager'와 '/sales-manager/input' 등 모든 하위 경로를 보호합니다.
 * 
 * 정책: /sales-manager 이하 전체를 보호 경로로 설정
 * - 대시보드(/sales-manager)도 포함하여 일관성 유지
 * - loading 체크가 추가되어 새로고침 시에도 정상 작동
 */
export const PROTECTED_PATH_PREFIXES = [
  '/sales-manager' // 대시보드 포함, 모든 하위 경로 보호
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
 * isProtectedPath('/sales-manager') // true
 * isProtectedPath('/sales-manager/input') // true
 * isProtectedPath('/sales-manager/input/sub') // true
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
