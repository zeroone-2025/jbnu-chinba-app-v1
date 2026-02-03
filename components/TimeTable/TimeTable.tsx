'use client';

import { useState, useCallback } from 'react';
import DaySelector from './DaySelector';
import DragGrid from './DragGrid';
import type { DayOfWeek, HeatmapSlot } from '@/app/types';

interface TimeTableProps {
  dates: string[];
  selectedDays: DayOfWeek[];
  timeSlots: string[];
  selectedSlots: Set<string>;
  heatmap: HeatmapSlot[];
  totalParticipants: number;
  hoveredMember: string | null;
  disabled?: boolean;
  showHeatmap?: boolean;
  onSelectedDaysChange: (days: DayOfWeek[]) => void;
  onSelectedSlotsChange: (slots: Set<string>) => void;
}

export default function TimeTable({
  dates,
  selectedDays,
  timeSlots,
  selectedSlots,
  heatmap,
  totalParticipants,
  hoveredMember,
  disabled = false,
  showHeatmap = true,
  onSelectedDaysChange,
  onSelectedSlotsChange,
}: TimeTableProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'add' | 'remove'>('add');

  const handleMouseDown = useCallback(
    (slot: string) => {
      setIsDragging(true);
      const newMode = selectedSlots.has(slot) ? 'remove' : 'add';
      setDragMode(newMode);

      const newSlots = new Set(selectedSlots);
      if (newMode === 'add') {
        newSlots.add(slot);
      } else {
        newSlots.delete(slot);
      }
      onSelectedSlotsChange(newSlots);
    },
    [selectedSlots, onSelectedSlotsChange]
  );

  const handleMouseEnter = useCallback(
    (slot: string) => {
      if (isDragging) {
        const newSlots = new Set(selectedSlots);
        if (dragMode === 'add') {
          newSlots.add(slot);
        } else {
          newSlots.delete(slot);
        }
        onSelectedSlotsChange(newSlots);
      }
    },
    [isDragging, dragMode, selectedSlots, onSelectedSlotsChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* 요일 선택 */}
      <DaySelector selectedDays={selectedDays} onSelectedDaysChange={onSelectedDaysChange} />

      {/* 시간 그리드 */}
      <DragGrid
        dates={dates}
        selectedDays={selectedDays}
        timeSlots={timeSlots}
        selectedSlots={selectedSlots}
        heatmap={heatmap}
        totalParticipants={totalParticipants}
        hoveredMember={hoveredMember}
        disabled={disabled}
        showHeatmap={showHeatmap}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={handleMouseUp}
      />
    </div>
  );
}
