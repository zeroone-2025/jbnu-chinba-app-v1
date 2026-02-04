// 백엔드 API 스펙 기반 타입 정의 (chinba.md 설계 기준)

/**
 * 이벤트 기본 정보
 */
export interface ChinbaEventInfo {
  event_id: string;
  title: string;
  dates: string[]; // ["2026-02-10", "2026-02-11"]
  time_zone: string;
  start_minute: number; // 540 = 09:00
  end_minute: number; // 1320 = 22:00
  slot_minutes: number; // 30 고정
  slot_count_per_day: number;
}

/**
 * 참가자 정보
 */
export interface ChinbaParticipant {
  user_id: number;
  name: string;
}

/**
 * 현재 로그인 유저의 참여 정보
 */
export interface ChinbaMeInfo {
  joined: boolean;
  availability: Record<string, number[]>; // {"2026-02-10": [2, 3, 4], ...}
}

/**
 * 히트맵 데이터 (날짜별 슬롯 인덱스 배열)
 */
export type ChinbaHeatmap = Record<string, number[]>; // {"2026-02-10": [0, 1, 2, 2, 1, 0], ...}

/**
 * GET /chinba/events/{eventId} 응답
 */
export interface ChinbaEventResponse {
  event: ChinbaEventInfo;
  participants: ChinbaParticipant[];
  heatmap: ChinbaHeatmap;
  me: ChinbaMeInfo | null;
}

/**
 * POST /chinba/events 요청
 */
export interface ChinbaCreateEventRequest {
  title: string;
  dates: string[];
  start_minute: number;
  end_minute: number;
  time_zone?: string;
}

/**
 * POST /chinba/events 응답
 */
export interface ChinbaCreateEventResponse {
  event_id: string;
  event_url: string;
}

/**
 * POST /chinba/events/{eventId}/join 응답
 */
export interface ChinbaJoinResponse {
  joined: boolean;
}

/**
 * PUT /chinba/events/{eventId}/me/availability 요청
 */
/**
 * PUT /chinba/events/{eventId}/me/availability 요청
 */
export interface ChinbaAvailabilityUpdateRequest {
  availability: Record<string, number[]>; // {"2026-02-10": [2, 3], ...}
}

/**
 * PUT /chinba/events/{eventId}/me/availability 응답
 */
export interface ChinbaSaveResponse {
  saved: boolean;
}

/**
 * GET /chinba/events/{eventId}/me/availability 응답
 */
export interface ChinbaAvailabilityResponse {
  availability: Record<string, number[]>;
}

/**
 * 요일 타입
 */
export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

/**
 * FREE TIME 구간 (UI 표시용)
 */
export interface FreeTimeSlot {
  day: DayOfWeek;
  date: string; // "2026-02-10"
  startTime: string; // "10:00"
  endTime: string; // "12:00"
}

/**
 * 슬롯 인덱스를 시간(분)으로 변환
 * @param slotIndex 슬롯 인덱스
 * @param startMinute 시작 분
 * @param slotMinutes 슬롯 단위 (기본 30)
 */
export function slotIndexToMinute(slotIndex: number, startMinute: number, slotMinutes: number = 30): number {
  return startMinute + slotIndex * slotMinutes;
}

/**
 * 분을 HH:MM 형식으로 변환
 * @param minute 분 (0-1439)
 */
export function minuteToTimeString(minute: number): string {
  const hours = Math.floor(minute / 60);
  const mins = minute % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * HH:MM 형식을 분으로 변환
 * @param timeString HH:MM 형식 문자열
 */
export function timeStringToMinute(timeString: string): number {
  const [hours, mins] = timeString.split(':').map(Number);
  return hours * 60 + mins;
}

// ============================================
// Authentication Types
// ============================================

/**
 * JWT 토큰 응답 (POST /auth/google, POST /auth/refresh)
 */
export interface Token {
  access_token: string;
  token_type: string;
}

/**
 * Google ID Token 요청 (POST /auth/google)
 */
export interface GoogleTokenRequest {
  token: string; // Google ID Token
}

/**
 * 인증 상태 확인 응답 (GET /auth/check)
 */
export interface AuthStatus {
  hasToken: boolean;
}

/**
 * 내 이벤트 목록 정보
 */
export interface ChinbaMyEventInfo {
  id: string;
  title: string;
  members: number;
  is_creator: boolean;
}

/**
 * GET /chinba/events/me/list 응답
 */
export interface ChinbaMyEventsResponse {
  events: ChinbaMyEventInfo[];
}
