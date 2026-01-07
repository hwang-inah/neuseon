// 메인 페이지 (서비스 선택 버튼)

import Link from 'next/link'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>NEUSEUN</h1>
        <p className={styles.subtitle}>쌓이면, 보이게 됩니다.</p>
      </div>

      <div className={styles.services}>
        <div className={styles.serviceCard}>
          <p className={styles.serviceCopy}>
            지금 가고 있는 길이,<br/ >괜찮은 방향일까요?
          </p>
          <Link href="/sales-manager" className={styles.serviceButton}>
            매출관리
          </Link>
        </div>

        <div className={styles.serviceCard}>
          <p className={styles.serviceCopy}>
            한 번만 더 생각해보고 보내도<br/ >늦지 않아요.
          </p>
          <Link href="/talk" className={styles.serviceButton}>
            대화정리
          </Link>
        </div>

        <div className={`${styles.serviceCard} ${styles.serviceCardDisabled}`}>
          <p className={styles.serviceCopy}>
            준비 중인 서비스입니다
          </p>
          <div className={styles.serviceDisabled}>준비중</div>
        </div>
      </div>
    </main>
  )
}