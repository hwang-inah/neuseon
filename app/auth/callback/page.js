// 인증 콜백 처리 페이지 (UI 없음, 리다이렉트 전용)

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 hash 파라미터 확인 (Google OAuth는 hash 사용)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')

        if (accessToken) {
          // 세션 설정 대기 (Supabase가 세션을 설정할 시간 확보)
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // 세션 확인
          const { data: { session }, error } = await supabase.auth.getSession()

          if (session) {
            // 성공: sessionStorage에서 redirectTo 확인
            const redirectTo = sessionStorage.getItem('auth_redirectTo')
            
            // sessionStorage에서 redirectTo 제거
            sessionStorage.removeItem('auth_redirectTo')
            
            // 보안: 내부 경로만 허용 (/로 시작)
            if (redirectTo && redirectTo.startsWith('/')) {
              router.replace(redirectTo)
            } else {
              // 없거나 유효하지 않으면 메인홈으로 이동
              router.replace('/')
            }
          } else {
            // 실패: 로그인 페이지로 리다이렉트 (에러 파라미터 포함)
            console.error('콜백: 세션이 없습니다', error)
            sessionStorage.removeItem('auth_redirectTo') // 실패 시에도 제거
            router.replace('/auth/login?error=callback_failed')
          }
        } else {
          // 액세스 토큰 없음: 로그인 페이지로 리다이렉트
          console.error('콜백: 액세스 토큰이 없습니다')
          sessionStorage.removeItem('auth_redirectTo') // 실패 시에도 제거
          router.replace('/auth/login?error=callback_failed')
        }
      } catch (err) {
        // 예외 발생: 로그인 페이지로 리다이렉트
        console.error('콜백 오류:', err)
        sessionStorage.removeItem('auth_redirectTo') // 실패 시에도 제거
        router.replace('/auth/login?error=callback_failed')
      }
    }

    handleCallback()
  }, [router])

  // UI 없음: 빈 화면 (사용자에게 보이지 않음)
  return null
}