import { useEffect, useState } from 'react'

const STORAGE_KEY = 'sales-input-draft'
const EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24시간

export function useDraftSave() {
  const [hasDraft, setHasDraft] = useState(false)
  const [draftData, setDraftData] = useState(null)

  // 페이지 로드 시 임시저장 데이터 확인
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY)
    
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        const now = Date.now()
        
        // 24시간 이내 데이터만 유효
        if (parsed.timestamp && (now - parsed.timestamp) < EXPIRY_TIME) {
          setHasDraft(true)
          setDraftData(parsed.data)
        } else {
          // 만료된 데이터 삭제
          localStorage.removeItem(STORAGE_KEY)
        }
      } catch (error) {
        console.error('임시저장 데이터 로드 실패:', error)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // 임시저장
  const saveDraft = (data) => {
    try {
      const draft = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    } catch (error) {
      console.error('임시저장 실패:', error)
    }
  }

  // 임시저장 데이터 삭제
  const clearDraft = () => {
    localStorage.removeItem(STORAGE_KEY)
    setHasDraft(false)
    setDraftData(null)
  }

  // 임시저장 거부 (저장은 유지, 알림만 숨김)
  const dismissDraft = () => {
    setHasDraft(false)
  }

  return {
    hasDraft,
    draftData,
    saveDraft,
    clearDraft,
    dismissDraft
  }
}