import type {
  ChinbaEventResponse,
  ChinbaCreateEventRequest,
  ChinbaCreateEventResponse,
  ChinbaJoinResponse,
  ChinbaAvailabilityUpdateRequest,
  ChinbaSaveResponse,
  ChinbaAvailabilityResponse,
  ChinbaMyEventsResponse,
  Token,
  AuthStatus,
} from '../types';
import { API_BASE_URL } from './constants';

/**
 * API 클라이언트 함수들
 * API Prefix: /chinba/events
 */

/**
 * 인증 헤더 생성
 */
function getAuthHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}


/**
 * 내 이벤트 목록 조회 (GET /chinba/events/me/list)
 */
export async function getMyEvents(token: string): Promise<ChinbaMyEventsResponse> {
  const response = await fetch(`${API_BASE_URL}/chinba/events/me/list`, {
    headers: getAuthHeaders(token),
  });
  if (!response.ok) {
    throw new Error('Failed to get my events');
  }
  return response.json();
}

/**
 * 이벤트 조회 (GET /chinba/events/{eventId})
 */
export async function getEvent(eventId: string, token?: string): Promise<ChinbaEventResponse> {
  const response = await fetch(`${API_BASE_URL}/chinba/events/${eventId}`, {
    headers: getAuthHeaders(token),
  });
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
}

/**
 * 이벤트 생성 (POST /chinba/events)
 */
export async function createEvent(data: ChinbaCreateEventRequest, token?: string): Promise<ChinbaCreateEventResponse> {
  const response = await fetch(`${API_BASE_URL}/chinba/events`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  return response.json();
}

/**
 * 이벤트 삭제/나가기 (DELETE /chinba/events/{eventId})
 */
export async function deleteEvent(eventId: string, token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/chinba/events/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  if (!response.ok) {
    throw new Error('Failed to delete event');
  }
}

/**
 * 이벤트 참여 (POST /chinba/events/{eventId}/join)
 * Google 로그인 필수
 */
export async function joinEvent(eventId: string, token: string): Promise<ChinbaJoinResponse> {
  const response = await fetch(`${API_BASE_URL}/chinba/events/${eventId}/join`, {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
  if (!response.ok) {
    throw new Error('Failed to join event');
  }
  return response.json();
}

/**
 * 내 가용 시간 업데이트 (PUT /chinba/events/{eventId}/me/availability)
 * Google 로그인 필수
 */
export async function updateMyAvailability(
  eventId: string,
  data: ChinbaAvailabilityUpdateRequest,
  token: string
): Promise<ChinbaSaveResponse> {
  const response = await fetch(`${API_BASE_URL}/chinba/events/${eventId}/me/availability`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update availability');
  }
  return response.json();
}

/**
 * 내 가용 시간 조회 (GET /chinba/events/{eventId}/me/availability)
 * Google 로그인 필수
 */
export async function getMyAvailability(eventId: string, token: string): Promise<ChinbaAvailabilityResponse> {
  const response = await fetch(`${API_BASE_URL}/chinba/events/${eventId}/me/availability`, {
    headers: getAuthHeaders(token),
  });
  if (!response.ok) {
    throw new Error('Failed to get availability');
  }
  return response.json();
}

// ============================================
// Authentication API
// ============================================

/**
 * Google ID Token으로 로그인 (POST /auth/google)
 * Google Sign-In으로 받은 ID Token을 백엔드로 전송하여 JWT 발급
 */
export async function loginWithGoogle(idToken: string): Promise<Token> {
  const response = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 쿠키 포함 (refresh token)
    body: JSON.stringify({ token: idToken }),
  });
  if (!response.ok) {
    throw new Error('Failed to login with Google');
  }
  return response.json();
}

/**
 * 인증 상태 확인 (GET /auth/check)
 * Refresh Token 쿠키 존재 여부 확인
 */
export async function checkAuthStatus(): Promise<AuthStatus> {
  const response = await fetch(`${API_BASE_URL}/auth/check`, {
    credentials: 'include', // 쿠키 포함
  });
  if (!response.ok) {
    throw new Error('Failed to check auth status');
  }
  return response.json();
}

/**
 * Access Token 갱신 (POST /auth/refresh)
 * Refresh Token 쿠키를 사용하여 새로운 Access Token 발급
 */
export async function refreshAccessToken(): Promise<Token> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include', // 쿠키 포함
  });
  if (!response.ok) {
    throw new Error('Failed to refresh token');
  }
  return response.json();
}

/**
 * 로그아웃 (POST /auth/logout)
 * Refresh Token 폐기 및 쿠키 삭제
 */
export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // 쿠키 포함
  });
  if (!response.ok) {
    throw new Error('Failed to logout');
  }
}

/**
 * Google OAuth 로그인 URL 가져오기 (GET /auth/google/login/url)
 * 서버사이드 OAuth flow용 (선택적)
 */
export async function getGoogleLoginUrl(platform: string = 'web'): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE_URL}/auth/google/login/url?platform=${platform}`);
  if (!response.ok) {
    throw new Error('Failed to get Google login URL');
  }
  return response.json();
}

/**
 * 현재 로그인한 사용자 정보 조회 (GET /users/me)
 * Access Token 필요
 */
export async function getUserInfo(token: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: getAuthHeaders(token),
  });
  if (!response.ok) {
    throw new Error('Failed to get user info');
  }
  return response.json();
}


