// 대화정리 분석 API
// POST /api/talk/analyze
// 1. 요청 검증
// 2. AI 모드 결정
// 3. 분석 실행 (현재는 MOCK)
// 4. 응답 스키마 검증
// 5. 응답 반환 (X-AI-Mode 헤더 포함)

import { NextResponse } from 'next/server'
import {
  RELATIONSHIP_TYPE_VALUES,
  USER_GOAL_VALUES,
  TONE_BASELINE_VALUES
} from '@/features/talk/constants/schema'
import { TALK_ERRORS } from '@/features/talk/constants/errors'

function createResponseHeaders() {
  // REAL AI 구현 전까지는 항상 MOCK 응답이므로 실행 기준으로 헤더 설정
  const headers = new Headers()
  headers.set('X-AI-Mode', 'MOCK')
  return headers
}

function jsonWithMode(payload, { status }) {
  return NextResponse.json(payload, {
    status,
    headers: createResponseHeaders()
  })
}

/**
 * MOCK 응답 생성
 * 
 * [REAL AI 교체 포인트]
 * - 이 함수는 REAL AI 응답 스키마의 "shape 기준"입니다
 * - 나중에 REAL AI 결과를 이 구조에 맞춰 매핑할 예정입니다
 * - REAL AI 연결 시 이 함수만 교체하거나 분기 처리합니다
 * 
 * [스키마 일관성]
 * - 반환되는 객체 구조는 validateResponseSchema()와 정확히 일치해야 합니다
 * - 필수 필드: summary, keyPoints, metadata
 * - 선택 필드: suggestedApproach, emotionalContext, potentialIssues
 */
function generateMockResponse(body, toneBaseline) {
  const now = new Date().toISOString()
  const text = body.conversationText.trim()

  return {
    summary: `대화 초반부를 보면 "${text.slice(0, 30)}..." 와 같은 흐름이 보입니다.`,
    keyPoints: [
      '상대방의 입장을 이해하고 있음을 표현하는 것이 중요합니다',
      '명확하고 구체적인 의사소통이 필요합니다',
      '감정적 공감과 논리적 설명의 균형이 중요합니다'
    ],
    suggestedApproach:
      '먼저 상대방의 입장을 이해하고 있음을 표현한 후, 구체적인 해결 방안을 제시하는 것이 효과적입니다.',
    emotionalContext:
      '대화 전반에 걸쳐 상호 이해를 높이려는 의도가 느껴집니다.',
    potentialIssues: [
      '감정적 표현이 부족할 수 있습니다',
      '명확한 해결책 제시가 필요할 수 있습니다'
    ],
    metadata: {
      analyzedAt: now,
      relationshipType: body.relationshipType,
      userGoal: body.userGoal,
      toneBaseline
    }
  }
}

// 응답 스키마 검증
function validateResponseSchema(data) {
  if (!data || typeof data !== 'object') return false

  if (!data.summary || typeof data.summary !== 'string') return false
  
  // keyPoints 배열 및 각 원소 타입 검증
  if (!Array.isArray(data.keyPoints)) return false
  if (!data.keyPoints.every(item => typeof item === 'string')) return false
  
  if (!data.metadata || typeof data.metadata !== 'object') return false

  const { analyzedAt, relationshipType, userGoal, toneBaseline } = data.metadata
  if (
    !analyzedAt || typeof analyzedAt !== 'string' ||
    !relationshipType || typeof relationshipType !== 'string' ||
    !userGoal || typeof userGoal !== 'string' ||
    toneBaseline === undefined || typeof toneBaseline !== 'string'
  ) {
    return false
  }

  if (
    data.suggestedApproach !== undefined &&
    typeof data.suggestedApproach !== 'string'
  ) {
    return false
  }

  if (
    data.emotionalContext !== undefined &&
    typeof data.emotionalContext !== 'string'
  ) {
    return false
  }

  // potentialIssues 배열 및 각 원소 타입 검증
  if (data.potentialIssues !== undefined) {
    if (!Array.isArray(data.potentialIssues)) return false
    if (!data.potentialIssues.every(item => typeof item === 'string')) return false
  }

  return true
}

export async function POST(request) {
  try {
    // 요청 바디 파싱
    const body = await request.json()

    // ===== 1. 필수 필드 검증 =====
    if (body.conversationText === undefined || body.conversationText === null) {
      return jsonWithMode(TALK_ERRORS.MISSING_FIELD('conversationText'), { status: 400 })
    }
    if (typeof body.conversationText !== 'string' || body.conversationText.trim().length < 5) {
      return jsonWithMode(
        TALK_ERRORS.INVALID_VALUE('conversationText', '대화 내용은 5자 이상 입력해주세요'),
        { status: 400 }
      )
    }

    if (!body.relationshipType) {
      return jsonWithMode(TALK_ERRORS.MISSING_FIELD('relationshipType'), { status: 400 })
    }

    if (!body.userGoal) {
      return jsonWithMode(TALK_ERRORS.MISSING_FIELD('userGoal'), { status: 400 })
    }

    // ===== 2. Enum 값 검증 =====
    if (!RELATIONSHIP_TYPE_VALUES.includes(body.relationshipType)) {
      return jsonWithMode(
        TALK_ERRORS.INVALID_ENUM('relationshipType', body.relationshipType),
        { status: 400 }
      )
    }

    if (!USER_GOAL_VALUES.includes(body.userGoal)) {
      return jsonWithMode(
        TALK_ERRORS.INVALID_ENUM('userGoal', body.userGoal),
        { status: 400 }
      )
    }

    // toneBaseline (선택 필드)
    const toneBaseline = body.toneBaseline ?? 'unknown'
    if (!TONE_BASELINE_VALUES.includes(toneBaseline)) {
      return jsonWithMode(
        TALK_ERRORS.INVALID_ENUM('toneBaseline', toneBaseline),
        { status: 400 }
      )
    }

    // ===== 3. 분석 실행 =====
    // REAL AI 구현 전까지는 항상 MOCK 응답
    const analysisResult = generateMockResponse(body, toneBaseline)

    // ===== 4. 응답 스키마 검증 =====
    if (!validateResponseSchema(analysisResult)) {
      return jsonWithMode(TALK_ERRORS.SCHEMA_VALIDATION_ERROR, { status: 500 })
    }

    // ===== 5. 응답 반환 =====
    return jsonWithMode(analysisResult, { status: 200 })
  } catch (error) {
    console.error('=== API 에러 발생 ===')
    console.error('Error:', error)
    console.error('Error Stack:', error.stack)
    console.error('Error Message:', error.message)

    // JSON 파싱 에러 (SyntaxError 중심으로 판단)
    if (error instanceof SyntaxError) {
      return jsonWithMode(TALK_ERRORS.PARSE_ERROR, { status: 400 })
    }

    // 그 외 모든 에러는 500으로 처리
    return jsonWithMode(TALK_ERRORS.INTERNAL_ERROR, { status: 500 })
  }
}