// 최상위 레이아웃 (로그인 체크만)

import './globals.css'

export const metadata = {
  title: 'neuseon',
  description: '쌓이면, 보이게 됩니다.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}