// 대화정리 페이지 - Server Component 엔트리
// 실제 UI/로직은 TalkClient 컴포넌트로 분리되어 있습니다.

import TalkClient from './TalkClient'

export default function TalkPage() {
  return <TalkClient />
}
