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
  const { user, isAuthenticated } = useAuth()

  // 보호 페이지에서 세션 없으면 로그인 페이지로 리다이렉트 (현재 경로를 redirectTo로 포함)
  // 대시보드(/sales-manager)는 공개 페이지이므로 리다이렉트하지 않음
  // 단, 로그아웃 진행 중인 경우는 예외: /sales-manager로 이동 (레이스 컨디션 방지)
  useEffect(() => {
    if (!isAuthenticated && isProtectedPath(pathname)) {
      // 로그아웃 진행 플래그 확인
      const logoutInProgress = sessionStorage.getItem('logoutInProgress') === '1'
      
      if (logoutInProgress) {
        // 로그아웃 직후: 대시보드로 이동하고 플래그 제거
        sessionStorage.removeItem('logoutInProgress')
        router.replace('/sales-manager')
      } else {
        // 비로그인 사용자가 보호 페이지 접근: 로그인 페이지로 리다이렉트
        const redirectTo = encodeURIComponent(pathname)
        router.push(`/auth/login?redirectTo=${redirectTo}`)
      }
    }
  }, [isAuthenticated, pathname, router])

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