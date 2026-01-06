'use client'

import styles from './DraftBanner.module.css'

export default function DraftBanner({ onRestore, onDismiss }) {
  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.icon}>💾</span>
        <span className={styles.text}>이전에 입력하던 내용이 있습니다</span>
      </div>
      <div className={styles.actions}>
        <button onClick={onRestore} className={styles.restoreButton}>
          불러오기
        </button>
        <button onClick={onDismiss} className={styles.dismissButton}>
          무시
        </button>
      </div>
    </div>
  )
}