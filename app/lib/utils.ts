import dayjs from 'dayjs';
import type { DayOfWeek, FreeTimeSlot, ChinbaHeatmap } from '../types';

/**
 * 시간 슬롯 생성 (30분 단위) - 분 단위 기반
 * @param startMinute 시작 분 (예: 540 = 09:00)
 * @param endMinute 종료 분 (예: 1320 = 22:00)
 * @param slotMinutes 슬롯 단위 (기본 30)
 * @returns 시간 배열 ["09:00", "09:30", "10:00", ...]
 */
export function generateTimeSlotsFromMinutes(
  startMinute: number,
  endMinute: number,
  slotMinutes: number = 30
): string[] {
  const slots: string[] = [];
  for (let minute = startMinute; minute < endMinute; minute += slotMinutes) {
    const hours = Math.floor(minute / 60);
    const mins = minute % 60;
    slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
  }
  return slots;
}

/**
 * 시간 슬롯 생성 (30분 단위) - 시간 단위 기반 (레거시 호환)
 * @param startHour 시작 시간 (예: 9)
 * @param endHour 종료 시간 (예: 22)
 * @returns 시간 배열 ["09:00", "09:30", "10:00", ...]
 */
export function generateTimeSlots(startHour: number, endHour: number): string[] {
  return generateTimeSlotsFromMinutes(startHour * 60, endHour * 60, 30);
}

/**
 * ISO string을 화면 표시용으로 변환
 * @param isoString "2024-05-20T10:00:00"
 * @returns { day: "월", time: "10:00", date: "2024-05-20" }
 */
export function formatDateTime(isoString: string): {
  day: DayOfWeek;
  time: string;
  date: string;
} {
  const dt = dayjs(isoString);
  const dayIndex = dt.day(); // 0(일) ~ 6(토)
  const days: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'];

  return {
    day: days[dayIndex],
    time: dt.format('HH:mm'),
    date: dt.format('YYYY-MM-DD'),
  };
}

/**
 * 날짜 문자열을 요일로 변환
 * @param dateString "2024-05-20"
 * @returns "월"
 */
export function parseDateString(dateString: string): DayOfWeek {
  const dt = dayjs(dateString);
  const dayIndex = dt.day();
  const days: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'];
  return days[dayIndex];
}

/**
 * 날짜 + 시간 → ISO string 변환
 * @param date "2024-05-20"
 * @param time "10:00"
 * @returns "2024-05-20T10:00:00"
 */
export function toISOString(date: string, time: string): string {
  return `${date}T${time}:00`;
}

/**
 * 슬롯 인덱스를 시간 문자열로 변환
 * @param slotIndex 슬롯 인덱스
 * @param startMinute 시작 분
 * @param slotMinutes 슬롯 단위 (기본 30)
 */
export function slotIndexToTimeString(
  slotIndex: number,
  startMinute: number,
  slotMinutes: number = 30
): string {
  const minute = startMinute + slotIndex * slotMinutes;
  const hours = Math.floor(minute / 60);
  const mins = minute % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * 시간 문자열을 슬롯 인덱스로 변환
 * @param timeString "10:00"
 * @param startMinute 시작 분
 * @param slotMinutes 슬롯 단위 (기본 30)
 */
export function timeStringToSlotIndex(
  timeString: string,
  startMinute: number,
  slotMinutes: number = 30
): number {
  const [hours, mins] = timeString.split(':').map(Number);
  const minute = hours * 60 + mins;
  return Math.floor((minute - startMinute) / slotMinutes);
}

/**
 * FREE TIME 계산 (모두가 가능한 시간) - 새 heatmap 형식 지원
 * @param heatmap 백엔드에서 받은 히트맵 데이터 (Record<string, number[]>)
 * @param dates 이벤트 날짜 배열
 * @param startMinute 시작 분
 * @param endMinute 종료 분
 * @param slotMinutes 슬롯 단위
 * @param totalParticipants 전체 참가자 수
 * @returns 모두가 가능한 시간 슬롯 배열
 */
export function calculateFreeTimeFromHeatmap(
  heatmap: ChinbaHeatmap,
  dates: string[],
  startMinute: number,
  endMinute: number,
  slotMinutes: number,
  totalParticipants: number
): FreeTimeSlot[] {
  const freeTimeSlots: FreeTimeSlot[] = [];

  if (totalParticipants === 0) return freeTimeSlots;

  dates.forEach((date) => {
    const day = parseDateString(date);
    const counts = heatmap[date] || [];

    // 연속된 구간을 찾기
    let currentStart: number | null = null;

    counts.forEach((count, slotIndex) => {
      // In negative selection mode: 0 count means everyone is free (no one is busy)
      const isAllAvailable = count === 0;

      if (isAllAvailable && currentStart === null) {
        // 구간 시작
        currentStart = slotIndex;
      } else if (!isAllAvailable && currentStart !== null) {
        // 구간 종료
        freeTimeSlots.push({
          day,
          date,
          startTime: slotIndexToTimeString(currentStart, startMinute, slotMinutes),
          endTime: slotIndexToTimeString(slotIndex, startMinute, slotMinutes),
        });
        currentStart = null;
      }
    });

    // 마지막 구간 처리
    if (currentStart !== null) {
      freeTimeSlots.push({
        day,
        date,
        startTime: slotIndexToTimeString(currentStart, startMinute, slotMinutes),
        endTime: slotIndexToTimeString(counts.length, startMinute, slotMinutes),
      });
    }
  });

  return freeTimeSlots;
}

/**
 * 히트맵 색상 계산
 * @param count 해당 시간에 가능한 사람 수
 * @param totalParticipants 전체 참가자 수
 * @returns Tailwind CSS 클래스
 */
export function getHeatmapColor(count: number, totalParticipants: number): string {
  if (totalParticipants === 0) return 'bg-white';

  // count = number of people busy (selected)
  // availableCount = total - count
  const availableCount = totalParticipants - count;
  const ratio = availableCount / totalParticipants;

  if (ratio >= 1.0) return 'bg-emerald-500'; // 모두 가능 (count === 0)
  if (ratio >= 0.66) return 'bg-emerald-400'; // 2/3 가능
  if (ratio >= 0.33) return 'bg-emerald-300'; // 1/3 가능
  return 'bg-emerald-200'; // 소수만 가능
}

/**
 * 특정 시간대로 스크롤
 * @param containerRef 스크롤 컨테이너 ref
 * @param targetDt ISO string
 */
export function scrollToTimeSlot(
  containerRef: React.RefObject<HTMLElement>,
  targetDt: string
): void {
  if (!containerRef.current) return;

  const { time } = formatDateTime(targetDt);
  const targetElement = containerRef.current.querySelector(
    `[data-time="${time}"]`
  );

  if (targetElement) {
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // 하이라이트 효과
    targetElement.classList.add('highlight-flash');
    setTimeout(() => {
      targetElement.classList.remove('highlight-flash');
    }, 2000);
  }
}

/**
 * 시간 범위 내의 모든 슬롯 인덱스 생성
 * @param startSlotIndex 시작 슬롯 인덱스
 * @param endSlotIndex 종료 슬롯 인덱스 (미포함)
 * @returns 슬롯 인덱스 배열
 */
export function generateSlotIndexRange(
  startSlotIndex: number,
  endSlotIndex: number
): number[] {
  const slots: number[] = [];
  for (let i = startSlotIndex; i < endSlotIndex; i++) {
    slots.push(i);
  }
  return slots;
}

/**
 * 시간 범위 내의 모든 슬롯 생성 (레거시 호환 - ISO string)
 * @param date 날짜
 * @param startTime 시작 시간
 * @param endTime 종료 시간 (미포함)
 * @returns ISO string 배열
 */
export function generateSlotRange(
  date: string,
  startTime: string,
  endTime: string
): string[] {
  const slots: string[] = [];
  const start = dayjs(`${date}T${startTime}:00`);
  const end = dayjs(`${date}T${endTime}:00`);

  let current = start;
  while (current.isBefore(end)) {
    slots.push(current.format('YYYY-MM-DDTHH:mm:ss'));
    current = current.add(30, 'minute');
  }

  return slots;
}

// 레거시 함수 - 이전 HeatmapSlot[] 형식 지원 (제거 예정)
interface LegacyHeatmapSlot {
  dt: string;
  count: number;
  members: string[];
}

/**
 * @deprecated 새 calculateFreeTimeFromHeatmap 사용 권장
 */
export function calculateFreeTime(
  heatmap: LegacyHeatmapSlot[],
  dates: string[],
  startHour: number,
  endHour: number,
  totalParticipants: number
): FreeTimeSlot[] {
  const freeTimeSlots: FreeTimeSlot[] = [];

  dates.forEach((date) => {
    const day = parseDateString(date);
    const timeSlots = generateTimeSlots(startHour, endHour);

    const allAvailableTimes = heatmap
      .filter((slot) => slot.dt.startsWith(date) && slot.count === totalParticipants)
      .map((slot) => dayjs(slot.dt).format('HH:mm'));

    let currentStart: string | null = null;

    timeSlots.forEach((time, index) => {
      const isAvailable = allAvailableTimes.includes(time);

      if (isAvailable && currentStart === null) {
        currentStart = time;
      } else if (!isAvailable && currentStart !== null) {
        const endTime = timeSlots[index - 1] || currentStart;
        freeTimeSlots.push({
          day,
          date,
          startTime: currentStart,
          endTime,
        });
        currentStart = null;
      }
    });

    if (currentStart !== null) {
      const endTime = timeSlots[timeSlots.length - 1];
      freeTimeSlots.push({
        day,
        date,
        startTime: currentStart,
        endTime,
      });
    }
  });

  return freeTimeSlots;
}
