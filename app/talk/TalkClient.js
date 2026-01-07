// 대화정리 페이지 - Client Component
// - 대화 입력을 받아 분석 API 호출
// - 분석 결과/에러를 화면에 표시

'use client'

import { useState } from 'react'
import TalkForm from '@/features/talk/components/TalkForm'
import StatusBanner from '@/features/talk/components/StatusBanner'
import AnalysisResult from '@/features/talk/components/AnalysisResult'
import { debugLog, debugError } from '@/shared/utils/debug'
import styles from './page.module.css'

export default function TalkClient() {
  // 입력 필드
  const [conversationText, setConversationText] = useState('')
  const [relationshipType, setRelationshipType] = useState('')
  const [userGoal, setUserGoal] = useState('')
  // toneBaseline은 현재 서버 기본값(unknown) 사용, 추후 UI 선택 가능하도록 확장 예정
  // const [toneBaseline, setToneBaseline] = useState('unknown')
  
  // UI 상태
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 응답 상태 (에러와 성공은 상호 배타적)
  const [errorMessage, setErrorMessage] = useState('')
  const [errorCode, setErrorCode] = useState('')
  const [errorField, setErrorField] = useState('')
  const [result, setResult] = useState(null)
  
  // 표시 전용 메타 정보 (분석 결과 로직에는 관여하지 않음)
  const [aiMode, setAiMode] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 상태 초기화 (에러와 성공은 상호 배타적)
    setErrorMessage('')
    setErrorCode('')
    setErrorField('')
    setResult(null)
    setAiMode('')
    
    // 클라이언트 측 기본 검증
    if (!conversationText.trim() || !relationshipType || !userGoal) {
      setErrorMessage('필수 항목을 모두 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/talk/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationText: conversationText.trim(),
          relationshipType,
          userGoal
          // toneBaseline은 추후 UI 선택 시 추가
          // toneBaseline: toneBaseline || undefined
        })
      })

      // 표시 전용 메타 정보: X-AI-Mode 헤더 읽기 (대소문자 대응)
      // 성공/에러 모두 헤더에서 읽어 표시 (디버깅/로깅 용도)
      // 헤더가 없으면 표시용 기본값 UNKNOWN 사용 (UNKNOWN도 화면에 표시, 로직에는 관여하지 않음)
      const modeHeader = response.headers.get('X-AI-Mode') || 
                         response.headers.get('x-ai-mode') || 
                         'UNKNOWN'
      setAiMode(modeHeader)

      // JSON 파싱 실패 방어: text()로 먼저 받고 JSON 파싱 시도
      const responseText = await response.text()
      let data
      
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        // JSON 파싱 실패 시 텍스트를 로그에 남기고 사용자에게는 명확한 메시지 표시
        debugError('=== 서버 응답 파싱 실패 ===')
        debugError('Response Status:', response.status)
        debugError('Response Text:', responseText)
        debugError('Parse Error:', parseError)
        
        setErrorMessage('서버 응답 파싱 실패: 서버가 예상하지 못한 형식의 응답을 반환했습니다.')
        setErrorCode('')
        setErrorField('')
        return
      }

      debugLog('=== 분석 결과 ===')
      debugLog('AI Mode (from header):', modeHeader)
      debugLog('Response Status:', response.status)
      debugLog('Response Data:', data)

      // 에러 응답 처리
      if (!response.ok) {
        // TALK_ERRORS 구조 { error, field, code } 활용
        const errorMsg = data?.error || '요청에 실패했습니다.'
        const code = data?.code || ''
        const field = data?.field || ''
        
        setErrorMessage(errorMsg)
        setErrorCode(code)
        setErrorField(field)
        
        // 디버깅용 정보는 콘솔에도 출력
        if (code || field) {
          debugError('Error Details:', { code, field })
        }
        // 에러 시에도 result는 null 유지 (에러와 성공 동시 표시 방지)
        return
      }

      // 성공 응답 처리
      setResult(data)
      // 성공 시 errorMessage는 빈 문자열 유지 (에러와 성공 동시 표시 방지)
    } catch (error) {
      debugError('=== 네트워크 에러 ===')
      debugError('Error:', error)
      setErrorMessage('요청 실패: 네트워크 상태를 확인해주세요.')
      setErrorCode('')
      setErrorField('')
      // 네트워크 에러 시에도 result는 null 유지
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>대화정리</h1>

      <TalkForm
        conversationText={conversationText}
        relationshipType={relationshipType}
        userGoal={userGoal}
        isSubmitting={isSubmitting}
        onConversationTextChange={(e) => setConversationText(e.target.value)}
        onRelationshipTypeChange={(e) => setRelationshipType(e.target.value)}
        onUserGoalChange={(e) => setUserGoal(e.target.value)}
        onSubmit={handleSubmit}
      />

      <StatusBanner
        isLoading={isSubmitting}
        errorMessage={errorMessage}
        errorCode={errorCode}
        errorField={errorField}
        aiMode={aiMode}
      />

      <AnalysisResult
        result={result}
        aiMode={aiMode}
        isLoading={isSubmitting}
      />
    </div>
  )
}
