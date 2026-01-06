// 로그인 페이지

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import styles from './page.module.css'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // URL 쿼리 파라미터에서 에러 확인
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'callback_failed') {
      setError('로그인 처리 중 문제가 발생했습니다. 다시 시도해주세요.')
    }
  }, [searchParams])

  // redirectTo를 sessionStorage에 확정 저장 (우선순위: query > 기존 sessionStorage > /)
  useEffect(() => {
    // (1) URL query에서 redirectTo 확인
    const queryRedirectTo = searchParams.get('redirectTo')
    
    // (2) 기존 sessionStorage에서 redirectTo 확인
    const existingRedirectTo = sessionStorage.getItem('auth_redirectTo')
    
    // 보안 검사 함수: /로 시작하는 내부 경로만 허용
    const isValidPath = (path) => {
      return path && typeof path === 'string' && path.startsWith('/')
    }
    
    let finalRedirectTo = '/'
    
    if (queryRedirectTo && isValidPath(queryRedirectTo)) {
      // (1) 우선순위: URL query의 redirectTo
      finalRedirectTo = queryRedirectTo
    } else if (existingRedirectTo && isValidPath(existingRedirectTo)) {
      // (2) 기존 sessionStorage의 redirectTo 유지
      finalRedirectTo = existingRedirectTo
    }
    // (3) 둘 다 없거나 유효하지 않으면 / (기본값)
    
    // sessionStorage에 확정 저장
    sessionStorage.setItem('auth_redirectTo', finalRedirectTo)
  }, [searchParams])

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (err) {
      console.error('로그인 오류:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1 className={styles.logo}>neuseon</h1>
        <p className={styles.subtitle}>서비스 이용을 위해 로그인하세요</p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <button
          className={styles.googleButton}
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className={styles.googleIcon} viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
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
