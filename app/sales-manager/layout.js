// 매출관리 전용 레이아웃 (네비)

'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './layout.module.css'

export default function SalesManagerLayout({ children }) {
  const pathname = usePathname()

  const navItems = [
    { href: '/sales-manager', label: '대시보드' },
    { href: '/sales-manager/input', label: '입력하기' },
    { href: '/sales-manager/compare', label: '비교분석' },
    { href: '/sales-manager/goals', label: '목표관리' }
  ]

  return (
    <div className={styles.container}>
      {/* 헤더 */}
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          느슨
        </Link>

        <nav className={styles.nav}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? styles.navLinkActive : styles.navLink}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}