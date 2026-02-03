'use client';

import { Check } from 'lucide-react';
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
  disabled?: boolean;
  showHeatmap?: boolean;
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
  disabled = false,
  showHeatmap = true,
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
    // 방 입장 전에는 히트맵 없음
    if (!showHeatmap) {
      return 'bg-gray-100';
    }

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
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm ${disabled ? 'opacity-60' : ''}`}
      onMouseUp={disabled ? undefined : onMouseUp}
      onMouseLeave={disabled ? undefined : onMouseUp}
    >
      {disabled ? (
        /* 로그인 전 안내 */
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">로그인하여 시간을 선택하세요</h3>
            <p className="text-sm text-gray-500">
              로그인 후 시간표를 선택할 수 있습니다
            </p>
          </div>
        </div>
      ) : filteredDates.length === 0 ? (
        /* 요일 미선택 시 안내 */
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">요일을 선택해 주세요</h3>
            <p className="text-sm text-gray-500">
              위의 요일 선택에서 원하는 요일을 선택하면<br />
              시간표가 표시됩니다
            </p>
          </div>
        </div>
      ) : (
        <>
      <div className="max-h-[500px] overflow-y-auto">
        <div
          className="grid"
          style={{
            gridTemplateColumns: `60px repeat(${filteredDates.length}, 1fr)`,
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
                const slot = heatmapMap.get(isoString);
                const isFreeTime = !slot || slot.count === 0;

                return (
                  <div
                    key={isoString}
                    onMouseDown={() => onMouseDown(isoString)}
                    onMouseEnter={() => onMouseEnter(isoString)}
                    data-slot={isoString}
                    className={`h-7 border-l border-b border-gray-100 cursor-pointer transition-colors relative ${
                      isSelected ? 'bg-blue-500' : heatmapColor
                    } hover:brightness-95 select-none`}
                  >
                    {showHeatmap && isFreeTime && !isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="text-emerald-600" size={14} strokeWidth={3} />
                      </div>
                    )}
                  </div>
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
          <span className="whitespace-nowrap">내 일정</span>
        </div>
        {showHeatmap && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border border-gray-300 flex items-center justify-center">
                <Check className="text-emerald-600" size={10} strokeWidth={3} />
              </div>
              <span className="whitespace-nowrap">모두 가능</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-lime-300" />
              <span className="whitespace-nowrap">소수만 일정</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-400" />
              <span className="whitespace-nowrap">1/3 일정</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-700" />
              <span className="whitespace-nowrap">2/3 일정</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-emerald-900" />
              <span className="whitespace-nowrap">모두 일정</span>
            </div>
          </>
        )}
      </div>
        </>
      )}
    </div>
  );
}
