// 목표설정 페이지 - Server Component 엔트리
// 실제 UI/로직은 GoalsClient 컴포넌트로 분리되어 있습니다.

import GoalsClient from './GoalsClient'

export default function GoalsPage() {
  return <GoalsClient />
}
