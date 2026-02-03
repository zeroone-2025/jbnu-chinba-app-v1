'use client';

import { toISOString, getHeatmapColor, formatDateTime } from '../../app/lib/utils';
import type { DayOfWeek, HeatmapSlot } from '../../app/types';

interface DragGridProps {
  dates: string[];
  selectedDays: DayOfWeek[];
  timeSlots: string[];
  selectedSlots: Set<string>;
  heatmap: HeatmapSlot[];
  totalParticipants: number;
  hoveredMember: string | null;
  onMouseDown: (slot: string) => void;
  onMouseEnter: (slot: string) => void;
  onMouseUp: () => void;
}

export default function DragGrid({
  dates,
  selectedDays,
  timeSlots,
  selectedSlots,
  heatmap,
  totalParticipants,
  hoveredMember,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}: DragGridProps) {
  // 선택된 요일에 해당하는 날짜만 필터링
  const filteredDates = dates.filter((date) => {
    const { day } = formatDateTime(`${date}T00:00:00`);
    return selectedDays.includes(day);
  });

  // 히트맵 데이터를 Map으로 변환 (빠른 조회)
  const heatmapMap = new Map<string, HeatmapSlot>();
  heatmap.forEach((slot) => {
    heatmapMap.set(slot.dt, slot);
  });

  // 히트맵 색상 계산
  const getSlotColor = (date: string, time: string): string => {
    const isoString = toISOString(date, time);
    const slot = heatmapMap.get(isoString);

    if (hoveredMember) {
      if (slot?.members.includes(hoveredMember)) {
        return 'bg-blue-400';
      }
      return 'bg-gray-100';
    }

    if (!slot) return 'bg-gray-100';
    return getHeatmapColor(slot.count, totalParticipants);
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <div className="max-h-[500px] overflow-y-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `60px repeat(${filteredDates.length}, minmax(80px, 1fr))`,
          }}
        >
          {/* 요일 헤더 */}
          <div className="p-3 text-center text-xs text-gray-500 font-medium bg-gray-50 border-b border-gray-200 sticky left-0 z-10">
            시간
          </div>
          {filteredDates.map((date) => {
            const { day } = formatDateTime(`${date}T00:00:00`);
            return (
              <div
                key={date}
                className="p-3 text-center text-sm font-semibold text-gray-900 bg-gray-50 border-l border-b border-gray-200"
              >
                {day}
              </div>
            );
          })}

          {/* 시간 슬롯 */}
          {timeSlots.map((time) => (
            <>
              <div
                key={`label-${time}`}
                className={`h-7 px-2 text-xs text-gray-500 flex items-center justify-center bg-gray-50 border-b border-gray-100 sticky left-0 z-10 ${
                  time.endsWith(':00') ? 'font-medium' : 'text-gray-400'
                }`}
              >
                {time.endsWith(':00') ? time : ''}
              </div>
              {filteredDates.map((date) => {
                const isoString = toISOString(date, time);
                const isSelected = selectedSlots.has(isoString);
                const heatmapColor = getSlotColor(date, time);

                return (
                  <div
                    key={isoString}
                    onMouseDown={() => onMouseDown(isoString)}
                    onMouseEnter={() => onMouseEnter(isoString)}
                    data-slot={isoString}
                    className={`h-7 border-l border-b border-gray-100 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-500' : heatmapColor
                    } hover:brightness-95 select-none`}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>

      {/* 범례 */}
      <div className="p-4 border-t border-gray-200 flex flex-wrap items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="whitespace-nowrap">내 선택</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-700" />
          <span className="whitespace-nowrap">모두 가능</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500" />
          <span className="whitespace-nowrap">2/3 이상</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-300" />
          <span className="whitespace-nowrap">1/3 이상</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-100" />
          <span className="whitespace-nowrap">소수</span>
        </div>
      </div>
    </div>
  );
}
