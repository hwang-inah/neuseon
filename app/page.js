// 메인 페이지 (서비스 선택 버튼)

import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>NEUSEON</h1>
        <p className={styles.subtitle}>쌓이면, 보이게 됩니다.</p>
      </div>

      <div className={styles.services}>
        <Link href="/sales-manager" className={styles.serviceButton}>
          매출관리
        </Link>
        
        <Link href="/talk" className={styles.serviceButton}>
          대화정리
        </Link>
        
        <div className={styles.serviceDisabled}>
          준비중
        </div>
      </div>
    </main>
  )
}