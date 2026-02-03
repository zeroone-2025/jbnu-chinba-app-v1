'use client';

import { DAYS } from '../../app/lib/constants';
import type { DayOfWeek } from '../../app/types';

interface DaySelectorProps {
  selectedDays: DayOfWeek[];
  onSelectedDaysChange: (days: DayOfWeek[]) => void;
}

export default function DaySelector({ selectedDays, onSelectedDaysChange }: DaySelectorProps) {
  const handleToggleDay = (day: DayOfWeek) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    onSelectedDaysChange(newDays);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600">표시할 요일:</span>
      <div className="flex gap-1">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => handleToggleDay(day)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
              selectedDays.includes(day)
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
}
