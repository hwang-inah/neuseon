// app/auth/login/page.js
// -----------------------------------------------------------------------------
// [역할] /auth/login 라우트의 엔트리(페이지) 컴포넌트
//
// Next.js(App Router)에서 page.js는 기본적으로 Server Component로 동작합니다.
// 이 페이지는 URL 쿼리스트링을 읽기 위해 Client Hook(useSearchParams)을 사용해야 하므로,
// 해당 로직은 Client Component(LoginClient)로 분리하고,
// 이 파일에서는 Suspense 경계 안에서 Client Component를 렌더링합니다.
//
// 이렇게 분리하면 Vercel 빌드(사전 렌더링 / 프리렌더 단계)에서
// useSearchParams 관련 오류가 발생하는 상황을 예방할 수 있습니다.
// -----------------------------------------------------------------------------

import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function LoginPage() {
  return (
    // [의도] Client Hook을 사용하는 컴포넌트는 런타임에서 안정적으로 렌더링되도록
    // Suspense 경계 안에서 렌더링합니다.
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  )
}
