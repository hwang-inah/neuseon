// 대시보드 - Server Component 엔트리
// 실제 UI/로직은 DashboardClient 컴포넌트로 분리되어 있습니다.

import DashboardClient from './DashboardClient'

// SEO 메타데이터 (데모 버전은 공개하여 SEO 활용)
export const metadata = {
  title: '매출관리 | NEUSEUN',
  description: '지금 가고 있는 길이, 괜찮은 방향일까요? 매출을 한눈에 관리하세요.',
  openGraph: {
    title: '매출관리 | NEUSEUN',
    description: '매출과 지출을 분석하고 목표를 달성하세요',
    type: 'website',
  },
  robots: {
    index: true,  // 데모 버전은 공개
    follow: true,
  },
}

export default function SalesManagerDashboard() {
  return <DashboardClient />
}
