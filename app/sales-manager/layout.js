'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/shared/contexts/AuthContext'
import { isProtectedPath } from '@/shared/constants/authRoutes'
import styles from './layout.module.css'

export default function SalesManagerLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, loading } = useAuth()

  // 보호 페이지 인증 가드
  // 우선순위: loading 체크 → logoutInProgress 처리 → 비인증+보호경로 리다이렉트
  useEffect(() => {
    // 1) 로딩 중이면 리다이렉트하지 않음 (새로고침 시 인증 상태 확인 대기)
    if (loading) return

    // 2) 로그아웃 진행 중인 경우 예외 처리 (레이스 컨디션 방지)
    const logoutInProgress = sessionStorage.getItem('logoutInProgress') === '1'
    if (logoutInProgress) {
      sessionStorage.removeItem('logoutInProgress')
      router.replace('/sales-manager')
      return
    }

    // 3) 비인증 사용자가 보호 경로 접근 시 로그인 페이지로 리다이렉트
    if (!isAuthenticated && isProtectedPath(pathname)) {
      // 현재 경로 전체(pathname + query)를 redirectTo에 포함
      const currentPath = typeof window !== 'undefined' 
        ? window.location.pathname + window.location.search 
        : pathname
      const redirectTo = encodeURIComponent(currentPath)
      router.replace(`/auth/login?redirectTo=${redirectTo}`)
    }
  }, [isAuthenticated, loading, pathname, router])

  // 로딩 중에는 children 대신 로딩 UI 표시 (깜빡임 방지)
  if (loading) {
    return (
      <div className={styles.container}>
        <nav className={styles.subNav}>
          {/* 네비게이션은 로딩 중에도 표시 (일관성) */}
          {[
            { href: '/sales-manager', label: '대시보드' },
            { href: '/sales-manager/input', label: '입력하기' },
            { href: '/sales-manager/compare', label: '비교분석' },
            { href: '/sales-manager/goals', label: '목표관리' }
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? styles.subNavLinkActive : styles.subNavLink}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className={styles.main}>
          <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
            로딩 중...
          </div>
        </main>
      </div>
    )
  }

  const navItems = [
    { href: '/sales-manager', label: '대시보드' },
    { href: '/sales-manager/input', label: '입력하기' },
    { href: '/sales-manager/compare', label: '비교분석' },
    { href: '/sales-manager/goals', label: '목표관리' }
  ]

  return (
    <div className={styles.container}>
      {/* 서브 네비 (2차 네비) */}
      <nav className={styles.subNav}>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? styles.subNavLinkActive : styles.subNavLink}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}