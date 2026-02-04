'use client';

import { Fragment } from 'react';
import { Check } from 'lucide-react';
import { toISOString, getHeatmapColor, formatDateTime, timeStringToSlotIndex } from '../../app/lib/utils';
import type { DayOfWeek, ChinbaHeatmap } from '../../app/types';
import { DEFAULT_START_MINUTE, SLOT_MINUTES } from '../../app/lib/constants';

interface DragGridProps {
  dates: string[];
  selectedDays: DayOfWeek[];
  timeSlots: string[];
  selectedSlots: Set<string>;
  heatmap: ChinbaHeatmap;
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

  // 히트맵에서 특정 날짜/시간의 count 가져오기
  const getSlotCount = (date: string, time: string): number => {
    const dateHeatmap = heatmap[date];
    if (!dateHeatmap) return 0;

    const slotIndex = timeStringToSlotIndex(time, DEFAULT_START_MINUTE, SLOT_MINUTES);
    return dateHeatmap[slotIndex] ?? 0;
  };

  // 히트맵 색상 계산
  const getSlotColor = (date: string, time: string): string => {
    if (!showHeatmap) {
      return 'bg-gray-100';
    }

    const count = getSlotCount(date, time);
    return getHeatmapColor(count, totalParticipants);
  };

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm ${disabled ? 'opacity-60' : ''}`}
      onMouseUp={disabled ? undefined : onMouseUp}
      onMouseLeave={disabled ? undefined : onMouseUp}
    >
      {filteredDates.length === 0 ? (
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
                <Fragment key={time}>
                  <div
                    key={`label-${time}`}
                    className={`h-7 px-2 text-xs text-gray-500 flex items-center justify-center bg-gray-50 border-b border-gray-100 sticky left-0 z-10 ${time.endsWith(':00') ? 'font-medium' : 'text-gray-400'
                      }`}
                  >
                    {time.endsWith(':00') ? time : ''}
                  </div>
                  {filteredDates.map((date) => {
                    const isoString = toISOString(date, time);
                    const isSelected = selectedSlots.has(isoString);
                    const heatmapColor = getSlotColor(date, time);
                    const count = getSlotCount(date, time);
                    const isFreeTime = count === 0 && totalParticipants > 0;

                    return (
                      <div
                        key={isoString}
                        onMouseDown={disabled ? undefined : () => onMouseDown(isoString)}
                        onMouseEnter={disabled ? undefined : () => onMouseEnter(isoString)}
                        data-slot={isoString}
                        className={`h-7 border-l border-b border-gray-100 transition-colors relative ${isSelected ? 'bg-blue-500' : heatmapColor
                          } ${disabled ? 'cursor-default' : 'cursor-pointer hover:brightness-95'} select-none`}
                      >
                        {showHeatmap && isFreeTime && !isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className="text-emerald-600" size={14} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </Fragment>
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
                  <div className="w-4 h-4 rounded bg-emerald-500 flex items-center justify-center">
                    <Check className="text-white" size={10} strokeWidth={3} />
                  </div>
                  <span className="whitespace-nowrap">모두 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-400" />
                  <span className="whitespace-nowrap">2/3 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-300" />
                  <span className="whitespace-nowrap">1/3 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-200" />
                  <span className="whitespace-nowrap">소수 가능</span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
