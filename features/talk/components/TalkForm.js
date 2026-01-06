// 대화 입력 폼 컴포넌트
// 입력 UI만 담당, 상태 관리나 fetch 로직은 page.js에 유지

import { RELATIONSHIP_TYPES, USER_GOALS } from '@/features/talk/constants/schema'
import styles from './TalkForm.module.css'

export default function TalkForm({
  conversationText,
  relationshipType,
  userGoal,
  isSubmitting,
  onConversationTextChange,
  onRelationshipTypeChange,
  onUserGoalChange,
  onSubmit
}) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="conversationText" className={styles.label}>
          대화 내용
        </label>
        <textarea
          id="conversationText"
          value={conversationText}
          onChange={onConversationTextChange}
          rows={10}
          className={styles.textarea}
          placeholder="분석할 대화 내용을 입력하세요..."
          disabled={isSubmitting}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="relationshipType" className={styles.label}>
          관계 타입
        </label>
        <select
          id="relationshipType"
          value={relationshipType}
          onChange={onRelationshipTypeChange}
          className={styles.select}
          disabled={isSubmitting}
        >
          <option value="">선택하세요</option>
          <option value={RELATIONSHIP_TYPES.COLLEAGUE}>동료</option>
          <option value={RELATIONSHIP_TYPES.FRIEND}>친구</option>
          <option value={RELATIONSHIP_TYPES.FAMILY}>가족</option>
          <option value={RELATIONSHIP_TYPES.CLIENT}>고객</option>
          <option value={RELATIONSHIP_TYPES.PARTNER}>파트너/협력사</option>
          <option value={RELATIONSHIP_TYPES.OTHER}>기타</option>
        </select>
      </div>

      <div className={styles.field}>
        <label htmlFor="userGoal" className={styles.label}>
          사용자 의도
        </label>
        <select
          id="userGoal"
          value={userGoal}
          onChange={onUserGoalChange}
          className={styles.select}
          disabled={isSubmitting}
        >
          <option value="">선택하세요</option>
          <option value={USER_GOALS.REDUCE_MISUNDERSTANDING}>오해 해소</option>
          <option value={USER_GOALS.APOLOGIZE}>사과 전달</option>
          <option value={USER_GOALS.EXPRESS_NEEDS}>필요/요구사항 표현</option>
          <option value={USER_GOALS.SET_BOUNDARIES}>경계 설정</option>
          <option value={USER_GOALS.CLOSE_CONVERSATION}>대화 마무리</option>
          <option value={USER_GOALS.UNDERSTAND_MY_FEELINGS}>내 감정 전달/이해 요청</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={styles.submitButton}
      >
        {isSubmitting ? '분석 중...' : '분석하기'}
      </button>
    </form>
  )
}
