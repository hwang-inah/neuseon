// 대화정리 페이지 - Server Component 엔트리
// 실제 UI/로직은 TalkClient 컴포넌트로 분리되어 있습니다.

import TalkClient from './TalkClient'

// SEO 메타데이터
export const metadata = {
  title: '대화정리 | NEUSEUN',
  description: '한 번만 더 생각해보고 보내도 늦지 않아요. 대화를 분석하고 개선하세요.',
  openGraph: {
    title: '대화정리 | NEUSEUN',
    description: '대화를 분석하고 개선하는 AI 도구',
    type: 'website',
  },
}

// SSG 강제 설정 (정적 페이지로 빌드 시 생성)
export const dynamic = 'force-static'

export default function TalkPage() {
  return <TalkClient />
}
