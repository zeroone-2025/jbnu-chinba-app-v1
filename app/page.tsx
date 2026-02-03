'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Menu, Copy, Check, Upload, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import IntegratedSidebar from '../components/Sidebar';
import TimeTable from '../components/TimeTable/TimeTable';
import DirectTimeInput from '../components/TimeTable/DirectTimeInput';
import type { DayOfWeek, Participant, HeatmapSlot } from './types';
import { generateTimeSlots, calculateFreeTime } from './lib/utils';

// 샘플 데이터
const SAMPLE_PARTICIPANTS: Participant[] = [
  { participant_id: 1, name: '김민수' },
  { participant_id: 2, name: '이서연' },
  { participant_id: 3, name: '박지훈' },
];

const SAMPLE_HEATMAP: HeatmapSlot[] = [
  // 월요일
  { dt: '2024-05-20T10:00:00', count: 3, members: ['김민수', '이서연', '박지훈'] },
  { dt: '2024-05-20T10:30:00', count: 3, members: ['김민수', '이서연', '박지훈'] },
  { dt: '2024-05-20T14:00:00', count: 2, members: ['김민수', '이서연'] },
  // 화요일
  { dt: '2024-05-21T11:00:00', count: 2, members: ['김민수', '박지훈'] },
  { dt: '2024-05-21T11:30:00', count: 2, members: ['김민수', '박지훈'] },
  // 수요일
  { dt: '2024-05-22T15:00:00', count: 3, members: ['김민수', '이서연', '박지훈'] },
  // 목요일
  { dt: '2024-05-23T13:00:00', count: 2, members: ['이서연', '박지훈'] },
  // 금요일
  { dt: '2024-05-24T16:00:00', count: 3, members: ['김민수', '이서연', '박지훈'] },
  // 토요일
  { dt: '2024-05-25T10:00:00', count: 1, members: ['김민수'] },
  // 일요일
  { dt: '2024-05-26T14:00:00', count: 2, members: ['이서연', '박지훈'] },
];

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomIdFromUrl = searchParams.get('room');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(roomIdFromUrl);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['월', '화', '수', '목', '금']);
  const [copied, setCopied] = useState(false);
  const [inputMode, setInputMode] = useState<'grid' | 'direct'>('grid');
  const [isFreeTimeOpen, setIsFreeTimeOpen] = useState(true);

  // URL 변경 시 currentRoomId 업데이트
  useEffect(() => {
    if (roomIdFromUrl) {
      setCurrentRoomId(roomIdFromUrl);
    }
  }, [roomIdFromUrl]);

  // 월~일에 해당하는 날짜 생성 (2024년 5월 20일은 월요일)
  const dates = [
    '2024-05-20', // 월요일
    '2024-05-21', // 화요일
    '2024-05-22', // 수요일
    '2024-05-23', // 목요일
    '2024-05-24', // 금요일
    '2024-05-25', // 토요일
    '2024-05-26', // 일요일
  ];
  const timeSlots = generateTimeSlots(9, 22);
  const participants = currentRoomId ? SAMPLE_PARTICIPANTS : [];
  const heatmap = currentRoomId ? SAMPLE_HEATMAP : [];
  const freeTime = currentRoomId
    ? calculateFreeTime(heatmap, dates, 9, 22, participants.length)
    : [];

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim()) {
      const roomId = roomCodeInput.trim();
      setCurrentRoomId(roomId);
      router.push(`?room=${roomId}`);
      setRoomCodeInput('');
    }
  };

  const handleCreateRoom = () => {
    // TODO: 방 생성 모달 또는 페이지
    const newRoomId = `room-${Date.now()}`;
    setCurrentRoomId(newRoomId);
    router.push(`?room=${newRoomId}`);
  };

  const handleSelectRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
    router.push(`?room=${roomId}`);
  };

  const handleCopyLink = useCallback(() => {
    if (!currentRoomId) return;
    const link = `${window.location.origin}?room=${currentRoomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentRoomId]);

  const handleSaveAvailability = () => {
    alert('이 기능은 아직 준비중입니다');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* 상단 헤더 */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          {/* 사이드바 토글 */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
            aria-label="사이드바 토글"
          >
            <Menu size={18} />
          </button>

          {/* 로고 */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
              친
            </div>
            <span className="text-lg font-semibold tracking-tight">친바</span>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-1">
          <button className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 transition-all">
            친바
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
            모이자
          </button>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* 통합 사이드바 (오버레이) */}
        {isSidebarOpen && (
          <>
            {/* 배경 오버레이 */}
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            {/* 사이드바 */}
            <div className="fixed left-0 top-14 bottom-0 z-50 h-[calc(100vh-3.5rem)]">
              <IntegratedSidebar
                isLoggedIn={isLoggedIn}
                onLoginToggle={() => setIsLoggedIn(!isLoggedIn)}
                currentRoomId={currentRoomId}
                participants={participants}
                freeTime={freeTime}
                hoveredMember={hoveredMember}
                onMemberHover={setHoveredMember}
                onCreateRoom={handleCreateRoom}
                onSelectRoom={handleSelectRoom}
              />
            </div>
          </>
        )}

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* 방 제목 또는 방 코드 입력 */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {currentRoomId ? (
                <>
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold">
                      {currentRoomId === 'sample-room' ? '2월 스터디 모임' : currentRoomId}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      {participants.length}명 참여 중
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors whitespace-nowrap"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                      {copied ? '복사됨!' : '초대 링크 복사'}
                    </button>
                    <button
                      onClick={handleSaveAvailability}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      <Upload size={16} />
                      시간표 업로드
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full">
                  <h2 className="text-lg font-semibold mb-3">방 코드 입력</h2>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <form onSubmit={handleJoinRoom} className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={roomCodeInput}
                        onChange={(e) => setRoomCodeInput(e.target.value)}
                        placeholder="방 코드를 입력하세요 (예: sample-room)"
                        className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!roomCodeInput.trim()}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        입장
                      </button>
                    </form>
                    <button
                      onClick={handleSaveAvailability}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      <Upload size={16} />
                      시간표 업로드
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 모두 가능한 시간 & 시간표 그리드 */}
            {currentRoomId && (
              <div className="mb-6">
                <button
                  onClick={() => setIsFreeTimeOpen(!isFreeTimeOpen)}
                  className="w-full sm:w-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors mb-3"
                >
                  <Clock size={16} />
                  <span className="text-sm font-medium">모두 가능한 시간</span>
                  {isFreeTimeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {isFreeTimeOpen && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    {freeTime.length > 0 ? (
                      <div className="space-y-3">
                        {/* 요일별로 그룹화 */}
                        {(() => {
                          // 요일별로 시간대 그룹화
                          const groupedByDay = freeTime.reduce((acc, slot) => {
                            if (!acc[slot.day]) {
                              acc[slot.day] = [];
                            }
                            acc[slot.day].push(slot);
                            return acc;
                          }, {} as Record<string, typeof freeTime>);

                          // 요일 순서 정의
                          const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];
                          
                          return dayOrder.map((day) => {
                            const slots = groupedByDay[day];
                            if (!slots || slots.length === 0) return null;

                            return (
                              <div key={day} className="flex items-start gap-3">
                                <div className="min-w-[2rem] pt-2">
                                  <span className="text-sm font-semibold text-gray-700">{day}</span>
                                </div>
                                <div className="flex-1 flex flex-wrap gap-2">
                                  {slots.map((slot, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200"
                                    >
                                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                      <span className="text-sm text-emerald-700">
                                        {slot.startTime} - {slot.endTime}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }).filter(Boolean);
                        })()}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic text-center py-2">
                        모두 가능한 시간이 없습니다
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 시간표 그리드 */}
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold">
                    {currentRoomId ? '내 가능 시간 선택' : '시간표 미리보기'}
                  </h2>
                  
                  {/* 모드 전환 버튼 */}
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg flex-shrink-0">
                    <button
                      onClick={() => setInputMode('grid')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                        inputMode === 'grid'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      그리드
                    </button>
                    <button
                      onClick={() => setInputMode('direct')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                        inputMode === 'direct'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      직접 입력
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-500">
                  {currentRoomId
                    ? '드래그하여 여러 시간대를 한번에 선택하세요'
                    : '방 코드를 입력하면 시간을 선택할 수 있습니다'}
                </p>
              </div>

              {inputMode === 'grid' ? (
                <TimeTable
                  dates={dates}
                  selectedDays={selectedDays}
                  timeSlots={timeSlots}
                  selectedSlots={selectedSlots}
                  heatmap={heatmap}
                  totalParticipants={participants.length || 1}
                  hoveredMember={hoveredMember ? String(hoveredMember) : null}
                  onSelectedDaysChange={setSelectedDays}
                  onSelectedSlotsChange={setSelectedSlots}
                />
              ) : (
                <DirectTimeInput
                  dates={dates}
                  selectedSlots={selectedSlots}
                  onSlotsAdd={(slots) => {
                    setSelectedSlots((prev) => {
                      const newSet = new Set(prev);
                      slots.forEach((slot) => newSet.add(slot));
                      return newSet;
                    });
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
