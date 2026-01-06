// 분석 결과 컴포넌트
// result가 있을 때만 렌더, 결과 카드들을 조합하는 컨테이너

import { useState } from 'react'
import ResultCard from './ResultCard'
import styles from './AnalysisResult.module.css'

export default function AnalysisResult({ result, aiMode, isLoading }) {
  // 로딩 상태: skeleton 카드 표시
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
        <div className={styles.skeletonCard} />
      </div>
    )
  }

  // 결과가 없으면 렌더링하지 않음
  if (!result) {
    return null
  }

  // 복사 기능
  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(result.summary)
      // 간단한 피드백 (추후 토스트로 개선 가능)
      alert('요약이 복사되었습니다.')
    } catch (error) {
      console.error('복사 실패:', error)
      alert('복사에 실패했습니다.')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.resultTitle}>분석 결과</h2>
        {/* 표시 전용 메타 정보: 성공 시 AI Mode 표시 (디버깅 용도, UNKNOWN 포함) */}
        {aiMode && (
          <span className={styles.aiMode}>
            (AI Mode: {aiMode})
          </span>
        )}
      </div>

      <div className={styles.cards}>
        {/* 요약 카드 */}
        <ResultCard
          title="요약"
          actionSlot={
            <button
              onClick={handleCopySummary}
              className={styles.copyButton}
              aria-label="요약 복사"
            >
              복사
            </button>
          }
        >
          <p className={styles.summaryText}>{result.summary}</p>
        </ResultCard>

        {/* 핵심 포인트 카드 */}
        {result.keyPoints && result.keyPoints.length > 0 && (
          <ResultCard title="핵심 포인트">
            <ul className={styles.keyPointsList}>
              {result.keyPoints.map((point, idx) => (
                <li key={idx} className={styles.keyPointItem}>
                  {point}
                </li>
              ))}
            </ul>
          </ResultCard>
        )}

        {/* 추천 접근 카드 (강조 스타일) */}
        {result.suggestedApproach && (
          <ResultCard title="추천 접근" variant="highlight">
            <p className={styles.approachText}>{result.suggestedApproach}</p>
          </ResultCard>
        )}

        {/* emotionalContext, potentialIssues는 추후 추가 예정 */}
      </div>
    </div>
  )
}
