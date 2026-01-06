// 최상위 레이아웃

import './globals.css'
import { AuthProvider } from '@/shared/contexts/AuthContext'
import LousseHeader from '@/shared/components/LousseHeader/LousseHeader'

export const metadata = {
  title: 'NEUSEON',
  description: '쌓이면, 보이게 됩니다.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <LousseHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}