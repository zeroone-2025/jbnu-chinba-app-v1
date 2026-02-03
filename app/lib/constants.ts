import type { DayOfWeek } from '../types';

/**
 * 요일 배열
 */
export const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];

/**
 * 기본 시간 범위
 */
export const DEFAULT_START_HOUR = 9;
export const DEFAULT_END_HOUR = 22;

/**
 * API 엔드포인트
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
