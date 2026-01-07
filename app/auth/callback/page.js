// 인증 콜백 처리 페이지 (UI 없음, 리다이렉트 전용)
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    let unsub = null
    let timeoutId = null

    const finish = (ok) => {
      // redirectTo 정리
      const redirectTo = sessionStorage.getItem('auth_redirectTo')
      sessionStorage.removeItem('auth_redirectTo')

      if (ok && redirectTo && redirectTo.startsWith('/')) {
        router.replace(redirectTo)
      } else if (ok) {
        router.replace('/')
      } else {
        router.replace('/auth/login?error=callback_failed')
      }
    }

    const run = async () => {
      try {
        // 1) 우선 현재 세션을 바로 확인
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error('콜백: getSession 오류', error)
        }

        if (data?.session) {
          finish(true)
          return
        }

        // 2) 세션이 아직 없으면, 로그인 이벤트를 기다림 (레이스 컨디션 방지)
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
          if (session) finish(true)
        })
        unsub = listener?.subscription?.unsubscribe

        // 3) 무한 대기 방지 타임아웃 (예: 6초)
        timeoutId = window.setTimeout(() => {
          console.error('콜백: 세션 대기 타임아웃')
          finish(false)
        }, 6000)
      } catch (err) {
        console.error('콜백 오류:', err)
        finish(false)
      }
    }

    run()

    return () => {
      if (typeof unsub === 'function') unsub()
      if (timeoutId) window.clearTimeout(timeoutId)
    }
  }, [router])

  return null
}
