// 임시 자동 로그인 컴포넌트 (개발용)
// 나중에 삭제 예정

// 'use client'

// import { useEffect, useState } from 'react'
// import { supabase } from '@/lib/supabase'

// export default function DevAutoLogin() {
//   const [status, setStatus] = useState('checking...')

//   useEffect(() => {
//     const checkAndLogin = async () => {
//       // 이미 로그인되어 있는지 확인
//       const { data: { session } } = await supabase.auth.getSession()
      
//       if (session) {
//         setStatus('✅ 로그인 됨: ' + session.user.email)
//         return
//       }

//       // 자동 로그인 시도
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: 'test@test.com',
//         password: 'test1234'
//       })

//       if (error) {
//         setStatus('❌ 로그인 실패: ' + error.message)
//       } else {
//         setStatus('✅ 자동 로그인 성공: ' + data.user.email)
//         window.location.reload()
//       }
//     }

//     checkAndLogin()
//   }, [])

//   return (
//     <div style={{
//       position: 'fixed',
//       bottom: '1rem',
//       right: '1rem',
//       padding: '0.5rem 1rem',
//       background: '#1f2937',
//       color: 'white',
//       borderRadius: '8px',
//       fontSize: '0.75rem',
//       zIndex: 9999
//     }}>
//       🔐 {status}
//     </div>
//   )
// }