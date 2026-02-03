import type {
  EventResponse,
  CreateEventRequest,
  CreateEventResponse,
  JoinEventRequest,
  JoinEventResponse,
  UpdateAvailabilityRequest,
} from '../types';
import { API_BASE_URL } from './constants';

/**
 * API 클라이언트 함수들
 */

/**
 * 이벤트 조회
 */
export async function getEvent(eventId: string): Promise<EventResponse> {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }
  return response.json();
}

/**
 * 이벤트 생성
 */
export async function createEvent(data: CreateEventRequest): Promise<CreateEventResponse> {
  const response = await fetch(`${API_BASE_URL}/api/events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create event');
  }
  return response.json();
}

/**
 * 참가자 등록
 */
export async function joinEvent(
  eventId: string,
  data: JoinEventRequest
): Promise<JoinEventResponse> {
  const response = await fetch(`${API_BASE_URL}/api/events/${eventId}/participants`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to join event');
  }
  return response.json();
}

/**
 * 가능 시간 업데이트
 */
export async function updateAvailability(
  participantId: number,
  data: UpdateAvailabilityRequest,
  token: string
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/participants/${participantId}/availability`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update availability');
  }
}
