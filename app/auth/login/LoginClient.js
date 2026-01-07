// app/auth/login/LoginClient.js
// -----------------------------------------------------------------------------
// [역할] /auth/login 페이지의 실제 UI + 로그인 로직 (Client Component)
//
// 이 파일은 브라우저 환경에서만 동작해야 하는 기능을 포함합니다.
// - URL 쿼리 파라미터 접근(useSearchParams)
// - sessionStorage 사용
// - window.location 접근
// - Supabase OAuth 로그인 트리거
//
// 따라서 파일 상단에 'use client'를 선언합니다.
//
// [주요 기능]
// 1) URL 쿼리의 error 값을 해석하여 사용자에게 에러 메시지를 표시
// 2) redirectTo 우선순위 규칙에 따라 로그인 후 이동 경로를 sessionStorage에 저장
// 3) Google OAuth 로그인(supabase.auth.signInWithOAuth) 실행
// -----------------------------------------------------------------------------

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export default function LoginClient() {
  // ---------------------------------------------------------------------------
  // [기능] URL 쿼리 파라미터 접근
  // - 예: /auth/login?redirectTo=/sales
  // - 예: /auth/login?error=callback_failed
  // ---------------------------------------------------------------------------
  const searchParams = useSearchParams()

  // ---------------------------------------------------------------------------
  // [상태] UI 상태 관리
  // - loading: OAuth 로그인 요청 진행 여부(버튼 비활성/문구 변경)
  // - error: 사용자에게 보여줄 오류 메시지
  // ---------------------------------------------------------------------------
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ---------------------------------------------------------------------------
  // [기능 1] URL 쿼리의 error 값을 해석하여 사용자에게 오류 안내
  // - /auth/callback 처리 과정에서 문제가 발생했을 때
  //   /auth/login?error=callback_failed 형태로 다시 돌아오게 되는 경우를 가정
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'callback_failed') {
      setError('로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.')
    }
  }, [searchParams])

  // ---------------------------------------------------------------------------
  // [기능 2] 로그인 후 이동할 경로(redirectTo)를 확정하여 sessionStorage에 저장
  //
  // [우선순위]
  //  (1) query redirectTo (가장 우선)
  //  (2) 기존 sessionStorage에 저장된 auth_redirectTo
  //  (3) 기본값 "/"
  //
  // [보안/안전]
  //  - 오픈 리다이렉트 방지: 외부 URL(https://...)을 허용하지 않고
  //    반드시 "/"로 시작하는 내부 경로만 허용합니다.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const queryRedirectTo = searchParams.get('redirectTo')
    const existingRedirectTo = sessionStorage.getItem('auth_redirectTo')

    // 내부 경로만 허용 (/로 시작하는 경로)
    const isValidPath = (path) =>
      path && typeof path === 'string' && path.startsWith('/')

    let finalRedirectTo = '/'

    if (queryRedirectTo && isValidPath(queryRedirectTo)) {
      finalRedirectTo = queryRedirectTo
    } else if (existingRedirectTo && isValidPath(existingRedirectTo)) {
      finalRedirectTo = existingRedirectTo
    }

    sessionStorage.setItem('auth_redirectTo', finalRedirectTo)
  }, [searchParams])

  // ---------------------------------------------------------------------------
  // [기능 3] Google OAuth 로그인 실행 (Supabase)
  //
  // - 사용자가 "Google로 시작하기" 버튼을 누르면 실행됩니다.
  // - Supabase가 Google 로그인 페이지로 리다이렉트합니다.
  // - 로그인 성공 후에는 options.redirectTo로 지정한 콜백 URL로 돌아옵니다.
  //   여기서는 /auth/callback 로 설정되어 있습니다.
  //
  // 참고:
  // - window.location.origin은 브라우저에서만 존재하므로 Client Component에서만 사용합니다.
  // ---------------------------------------------------------------------------
  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (err) {
      console.error('로그인 오류:', err)
      setError(err?.message ?? '로그인 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  // ---------------------------------------------------------------------------
  // [UI] 로그인 화면 렌더링
  // - 에러 메시지 표시
  // - Google 로그인 버튼 (loading 동안 비활성)
  // ---------------------------------------------------------------------------
  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.logo}>neuseon</h1>
        <p className={styles.subtitle}>서비스 이용을 위해 로그인하세요</p>

        {error && <div className={styles.error}>{error}</div>}

        <button
          className={styles.googleButton}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {loading ? '로그인 중...' : 'Google로 시작하기'}
        </button>

        <p className={styles.terms}>
          로그인하면 서비스 이용약관 및 개인정보 처리방침에 동의하게 됩니다.
        </p>
      </div>
    </div>
  )
}
