'use client';

import { useState } from 'react';
import { DAYS } from '../../app/lib/constants';
import { generateSlotRange, formatDateTime, toISOString } from '../../app/lib/utils';
import type { DayOfWeek } from '../../app/types';

interface DirectTimeInputProps {
  dates: string[];
  selectedSlots: Set<string>;
  onSlotsAdd: (slots: string[]) => void;
}

export default function DirectTimeInput({ dates, selectedSlots, onSlotsAdd }: DirectTimeInputProps) {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('월');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  // 선택된 요일에 해당하는 날짜 찾기
  const getDateForDay = (day: DayOfWeek): string | null => {
    for (const date of dates) {
      const { day: dateDay } = formatDateTime(`${date}T00:00:00`);
      if (dateDay === day) {
        return date;
      }
    }
    return dates[0] || null;
  };

  const handleAddTime = () => {
    const date = getDateForDay(selectedDay);
    if (!date) {
      alert('날짜를 찾을 수 없습니다');
      return;
    }

    // 시작 시간이 종료 시간보다 늦은지 확인
    if (startTime >= endTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다');
      return;
    }

    const slots = generateSlotRange(date, startTime, endTime);
    onSlotsAdd(slots);

    // 확인 메시지
    alert('시간이 추가되었습니다');
  };

  // 선택된 시간을 요일별로 그룹화
  const groupedSlots = new Map<DayOfWeek, string[]>();
  selectedSlots.forEach((slot) => {
    const { day, time } = formatDateTime(slot);
    if (!groupedSlots.has(day)) {
      groupedSlots.set(day, []);
    }
    groupedSlots.get(day)!.push(time);
  });

  // 시간 범위로 변환
  const getTimeRanges = (times: string[]): string[] => {
    if (times.length === 0) return [];
    
    const sorted = times.sort();
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const prevMinutes = parseInt(prev.split(':')[0]) * 60 + parseInt(prev.split(':')[1]);
      const currentMinutes = parseInt(current.split(':')[0]) * 60 + parseInt(current.split(':')[1]);

      if (currentMinutes - prevMinutes > 30) {
        // 구간 종료 - 마지막 시간 + 30분을 종료 시간으로 표시
        const endMinutes = prevMinutes + 30;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;
        const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
        ranges.push(`${start} - ${endTime}`);
        start = current;
      }
      prev = current;
    }
    
    // 마지막 구간 처리 - 마지막 시간 + 30분
    const lastMinutes = parseInt(prev.split(':')[0]) * 60 + parseInt(prev.split(':')[1]);
    const lastEndMinutes = lastMinutes + 30;
    const lastEndHour = Math.floor(lastEndMinutes / 60);
    const lastEndMin = lastEndMinutes % 60;
    const lastEndTime = `${lastEndHour.toString().padStart(2, '0')}:${lastEndMin.toString().padStart(2, '0')}`;
    ranges.push(`${start} - ${lastEndTime}`);
    
    return ranges;
  };

  return (
    <div className="space-y-4">
      {/* 입력 폼 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">직접 시간 입력</h3>
        
        <div className="space-y-3">
          {/* 요일 선택 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              요일
            </label>
            <div className="flex gap-1">
              {DAYS.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedDay === day
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* 시간 선택 */}
          <div className="space-y-3">
            {/* 시작 시간 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                시작 시간
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={startTime.split(':')[0]}
                  onChange={(e) => setStartTime(`${e.target.value}:${startTime.split(':')[1]}`)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <option key={hour} value={hour}>
                        {hour}시
                      </option>
                    );
                  })}
                </select>
                <select
                  value={startTime.split(':')[1]}
                  onChange={(e) => setStartTime(`${startTime.split(':')[0]}:${e.target.value}`)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="00">00분</option>
                  <option value="30">30분</option>
                </select>
              </div>
            </div>

            {/* 종료 시간 */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                종료 시간
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={endTime.split(':')[0]}
                  onChange={(e) => setEndTime(`${e.target.value}:${endTime.split(':')[1]}`)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <option key={hour} value={hour}>
                        {hour}시
                      </option>
                    );
                  })}
                </select>
                <select
                  value={endTime.split(':')[1]}
                  onChange={(e) => setEndTime(`${endTime.split(':')[0]}:${e.target.value}`)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer"
                >
                  <option value="00">00분</option>
                  <option value="30">30분</option>
                </select>
              </div>
            </div>
          </div>

          {/* 추가 버튼 */}
          <button
            onClick={handleAddTime}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm"
          >
            시간 추가
          </button>
        </div>
      </div>

      {/* 선택된 시간 표시 */}
      {selectedSlots.size > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <h3 className="text-sm font-semibold mb-3">선택된 시간</h3>
          <div className="space-y-2">
            {DAYS.map((day) => {
              const times = groupedSlots.get(day);
              if (!times || times.length === 0) return null;
              
              const ranges = getTimeRanges(times);
              return (
                <div key={day} className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-700 min-w-[2rem]">
                    {day}
                  </span>
                  <div className="flex-1 flex flex-wrap gap-1">
                    {ranges.map((range, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs"
                      >
                        {range}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
