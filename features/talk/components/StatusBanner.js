// 상태 배너 컴포넌트
// 로딩 상태, 에러 메시지, AI Mode 표시

import styles from './StatusBanner.module.css'

export default function StatusBanner({
  isLoading,
  errorMessage,
  errorCode,
  errorField,
  aiMode
}) {
  // 로딩 상태
  if (isLoading) {
    return null // 로딩은 AnalysisResult의 skeleton으로 표시
  }

  // 에러 상태
  if (errorMessage) {
    return (
      <div className={styles.errorBanner}>
        <div className={styles.errorTitle}>에러</div>
        <div className={styles.errorMessage}>{errorMessage}</div>
        
        {/* 디버깅용 정보: code/field는 작은 글씨로 표시 */}
        {(errorCode || errorField) && (
          <div className={styles.errorDetails}>
            {errorCode && <span>Code: {errorCode}</span>}
            {errorCode && errorField && <span> • </span>}
            {errorField && <span>Field: {errorField}</span>}
          </div>
        )}
        
        {/* 표시 전용 메타 정보: 에러 시에도 AI Mode 표시 (디버깅 용도, UNKNOWN 포함) */}
        {aiMode && (
          <div className={styles.aiMode}>
            AI Mode: {aiMode}
          </div>
        )}
      </div>
    )
  }

  return null
}
