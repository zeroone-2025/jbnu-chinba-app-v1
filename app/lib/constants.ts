import type { DayOfWeek } from '../types';

/**
 * 요일 배열
 */
export const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];

/**
 * 기본 시간 범위 (분 단위)
 * 540 = 09:00, 1320 = 22:00
 */
export const DEFAULT_START_MINUTE = 540; // 09:00
export const DEFAULT_END_MINUTE = 1320; // 22:00

/**
 * 슬롯 단위 (분)
 */
export const SLOT_MINUTES = 30;

/**
 * 기본 타임존
 */
export const DEFAULT_TIMEZONE = 'Asia/Seoul';

/**
 * API 엔드포인트
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
