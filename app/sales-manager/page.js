// 대시보드 - Server Component 엔트리
// 실제 UI/로직은 DashboardClient 컴포넌트로 분리되어 있습니다.

import DashboardClient from './DashboardClient'

export default function SalesManagerDashboard() {
  return <DashboardClient />
}
