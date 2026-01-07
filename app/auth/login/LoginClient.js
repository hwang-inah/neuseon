// app/auth/login/LoginClient.js
// -----------------------------------------------------------------------------
// [역할] /auth/login 페이지의 실제 UI + 로그인 로직 (Client Component)
//
// 브라우저 전용 기능을 사용합니다.
// - URL 쿼리 파라미터 접근(useSearchParams)
// - sessionStorage 사용
// - window.location 접근
// - Supabase OAuth 로그인 트리거
//
// [주요 기능]
// 1) URL 쿼리의 error 값을 해석하여 사용자에게 에러 메시지 표시
// 2) redirectTo 우선순위 규칙에 따라 로그인 후 이동 경로를 sessionStorage에 저장
// 3) Google OAuth 로그인 실행 (supabase.auth.signInWithOAuth)
// 4) 모바일 인앱 브라우저(네이버/카톡/인스타 등)에서 Google 로그인이 차단될 수 있어 안내 표시
// -----------------------------------------------------------------------------

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

// -----------------------------------------------------------------------------
// [유틸] 인앱 브라우저 감지
// - 네이버/카톡/인스타/페북 등 앱 내 WebView에서는 Google OAuth가 정책상 차단될 수 있음
// - 차단 시 Google에서 403 disallowed_useragent 발생
// -----------------------------------------------------------------------------
function detectInAppBrowser() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent.toLowerCase()

  // 대표 인앱/웹뷰 패턴 (필요시 확장 가능)
  return (
    ua.includes('naver') ||
    ua.includes('kakaotalk') ||
    ua.includes('instagram') ||
    ua.includes('fbav') ||
    ua.includes('fban') ||
    ua.includes('line') ||
    ua.includes('wv') // Android WebView 흔한 표식
  )
}

// -----------------------------------------------------------------------------
// [유틸] 내부 경로만 허용 (오픈 리다이렉트 방지)
// - "/"로 시작하는 내부 경로만 인정
// -----------------------------------------------------------------------------
function isValidInternalPath(path) {
  return typeof path === 'string' && path.startsWith('/')
}

export default function LoginClient() {
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isInApp, setIsInApp] = useState(false)

  // 인앱 브라우저 감지 (1회)
  useEffect(() => {
    setIsInApp(detectInAppBrowser())
  }, [])

  // ---------------------------------------------------------------------------
  // [기능 1] URL 쿼리의 error 값을 해석하여 사용자에게 오류 안내
  // - /auth/callback 처리 중 실패 → /auth/login?error=callback_failed 로 돌아오는 시나리오
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const errorParam = searchParams.get('error')

    if (errorParam === 'callback_failed') {
      setError('로그인 처리 중 문제가 발생했습니다. 브라우저(Safari/Chrome)에서 다시 시도해주세요.')
      return
    }

    // 다른 에러 파라미터가 있다면 여기에 추가로 매핑 가능
    if (errorParam) {
      setError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
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
  // [보안]
  //  - 외부 URL(https://...) 등은 허용하지 않고 "/"로 시작하는 내부 경로만 허용
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // 1) URL query에서 redirectTo 확인
    const queryRedirectTo = searchParams.get('redirectTo')

    // 2) 기존 sessionStorage에 저장된 값 확인 (있으면 유지)
    const existingRedirectTo =
      typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirectTo') : null

    let finalRedirectTo = '/'

    if (queryRedirectTo && isValidInternalPath(queryRedirectTo)) {
      finalRedirectTo = queryRedirectTo
    } else if (existingRedirectTo && isValidInternalPath(existingRedirectTo)) {
      finalRedirectTo = existingRedirectTo
    }

    sessionStorage.setItem('auth_redirectTo', finalRedirectTo)
  }, [searchParams])

  // ---------------------------------------------------------------------------
  // [기능 3] Google OAuth 로그인 실행 (Supabase)
  // - 인앱 브라우저에서는 Google 정책으로 차단될 수 있어 안내 후 진행
  // - redirectTo는 현재 도메인 기준(/auth/callback)으로 설정
  // ---------------------------------------------------------------------------
  const handleGoogleLogin = async () => {
    try {
      setError(null)

      // 인앱 브라우저에서는 실패 가능성이 높으므로 사전 경고
      if (isInApp) {
        // 사용자가 원하면 그대로 시도할 수 있게 confirm 형태로 처리
        const proceed = window.confirm(
          '현재 인앱 브라우저(네이버/카카오 등)에서는 Google 로그인이 차단될 수 있습니다.\n\nSafari(또는 Chrome)에서 열어 로그인하는 것을 권장합니다.\n\n그래도 계속 진행할까요?'
        )
        if (!proceed) return
      }

      setLoading(true)

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

  // 안내 문구 (인앱 브라우저에서만 노출)
  const inAppNotice = useMemo(() => {
    if (!isInApp) return null
    return (
      <div className={styles.error} style={{ marginBottom: 12 }}>
        현재 네이버/카카오 등 <b>인앱 브라우저</b>에서는 Google 로그인이 차단될 수 있습니다.
        <br />
        우측 상단 메뉴에서 <b>“Safari(또는 Chrome)에서 열기”</b>로 이동 후 로그인해주세요.
      </div>
    )
  }, [isInApp])

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.logo}>neuseun</h1>
        <p className={styles.subtitle}>서비스 이용을 위해 로그인하세요</p>

        {inAppNotice}
        {error && <div className={styles.error}>{error}</div>}

        <button
          className={styles.googleButton}
          onClick={handleGoogleLogin}
          disabled={loading}
          aria-busy={loading}
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
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
