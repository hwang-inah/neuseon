// 전역 헤더 컴포넌트
// 로그인/로그아웃 UI (세션은 AuthContext에서 소비)

'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/shared/hooks/useToast'
import { useAuth } from '@/shared/contexts/AuthContext'
import { isProtectedPath } from '@/shared/constants/authRoutes'
import Toast from '@/shared/components/Toast'
import styles from './LousseHeader.module.css'

export default function LousseHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { toast, hideToast } = useToast()

  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      setIsLoggingOut(true)
      
      try {
        // 로그아웃 진행 플래그 설정 (auth guard가 로그인 페이지로 리다이렉트하는 것을 방지)
        sessionStorage.setItem('logoutInProgress', '1')
        
        // 보호 페이지에서 로그아웃하는 경우: 먼저 페이지 이동 (guard가 실행되기 전에 언마운트)
        if (isProtectedPath(pathname)) {
          // await 없이 즉시 실행하여 보호 페이지를 언마운트시킴
          router.replace('/sales-manager')
          // 약간의 지연을 주어 페이지 이동이 완료되도록 함
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        // 그 다음에 세션 제거 (이 시점에는 이미 대시보드로 이동했으므로 guard가 실행되지 않음)
        await supabase.auth.signOut()
        
        // 그 외 공개 페이지(/, /sales-manager, /talk 등)는 이동하지 않고 현재 페이지 유지
      } finally {
        // 로그아웃 완료 후 플래그 제거
        sessionStorage.removeItem('logoutInProgress')
        setIsLoggingOut(false)
      }
    }
  }

  // 로그인 링크 생성 (현재 경로를 redirectTo로 포함)
  const getLoginHref = () => {
    const redirectTo = encodeURIComponent(pathname)
    return `/auth/login?redirectTo=${redirectTo}`
  }

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          neuseun
        </Link>

        <div className={styles.userSection}>
          {isAuthenticated ? (
            <>
              <span className={styles.userEmail}>{user.email}</span>
              <button 
                onClick={handleLogout} 
                className={styles.logoutButton}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
              </button>
            </>
          ) : (
            <Link 
              href={getLoginHref()}
              className={`${styles.loginButton} ${loading ? styles.loading : ''}`}
              aria-disabled={loading}
              onClick={(e) => {
                if (loading) {
                  e.preventDefault()
                }
              }}
            >
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  <span>로그인</span>
                </>
              ) : (
                '로그인'
              )}
            </Link>
          )}
        </div>
      </header>

      {/* 로그인 성공 토스트 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  )
}
