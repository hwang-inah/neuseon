// 목표설정 페이지 - Server Component 엔트리
// 실제 UI/로직은 GoalsClient 컴포넌트로 분리되어 있습니다.

import GoalsClient from './GoalsClient'

// SEO 메타데이터 (개인 데이터 페이지이므로 검색엔진 인덱싱 방지)
export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function GoalsPage() {
  return <GoalsClient />
}
