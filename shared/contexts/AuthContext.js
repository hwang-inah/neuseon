// 전역 인증 상태 관리 Context
// 세션 확인은 이곳에서만 수행하고, 다른 컴포넌트는 context를 통해 소비

'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/shared/hooks/useToast'

const AuthContext = createContext(null)

// 디버그 로그 플래그 (개발 중에만 true)
const DEBUG_AUTH = process.env.NODE_ENV === 'development' && false // 기본적으로 false로 설정

function logDebug(...args) {
  if (DEBUG_AUTH) {
    console.log(...args)
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const hasShownLoginToast = useRef(false)
  const { showSuccess } = useToast()
  const showSuccessRef = useRef(showSuccess)

  // showSuccess 최신 함수 참조 유지
  useEffect(() => {
    showSuccessRef.current = showSuccess
  }, [showSuccess])

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      
      logDebug('🔐 전역 인증 체크:', { 
        hasSession: !!initialSession,
        user: initialSession?.user?.email
      })

      setSession(initialSession)
      setLoading(false)
    }

    checkAuth()

    // 세션 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // INITIAL_SESSION은 로그 없이 바로 return
      if (event === 'INITIAL_SESSION') return

      // 핵심 이벤트만 로그 (로그인/로그아웃)
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('🔄 세션 변화:', { event, user: newSession?.user?.email })
      } else {
        logDebug('🔄 세션 변화:', { event, user: newSession?.user?.email })
      }

      // 로그인 성공 시 토스트 표시 (1회만)
      if (event === 'SIGNED_IN' && newSession && !hasShownLoginToast.current) {
        hasShownLoginToast.current = true
        showSuccessRef.current('로그인되었습니다')
      }

      // 로그아웃 시 토스트 플래그 리셋
      if (event === 'SIGNED_OUT') {
        hasShownLoginToast.current = false
      }

      // stale session 유지: 기존에 세션이 있었고 새 세션이 null이면 기존 세션 유지
      setSession(prevSession => {
        if (prevSession && !newSession && event !== 'SIGNED_OUT') {
          // 로그아웃이 아닌 경우에만 stale session 유지
          return prevSession
        }
        return newSession
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    session,
    user: session?.user ?? null,
    isAuthenticated: !!session?.user,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
