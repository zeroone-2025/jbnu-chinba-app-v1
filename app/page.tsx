'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Menu, Copy, Check, Upload, ChevronDown, ChevronUp, Clock, Users, Pencil, X } from 'lucide-react';
import IntegratedSidebar from '../components/Sidebar';
import Header from '../components/Header';
import TimeTable from '../components/TimeTable/TimeTable';
import DirectTimeInput from '../components/TimeTable/DirectTimeInput';
import type {
  DayOfWeek,
  ChinbaEventResponse,
  ChinbaParticipant,
  ChinbaHeatmap,
  FreeTimeSlot,
} from './types';
import {
  generateTimeSlotsFromMinutes,
  calculateFreeTimeFromHeatmap,
} from './lib/utils';
import {
  getEvent,
  createEvent,
  joinEvent,
  updateMyAvailability,
  checkAuthStatus,
  refreshAccessToken,
  getUserInfo,
  logout as apiLogout,
  getMyEvents,
  deleteEvent,
} from './lib/api';
import { getAccessToken, setAccessToken, clearAccessToken, hasAccessToken } from './lib/tokenStore';
import { DEFAULT_START_MINUTE, DEFAULT_END_MINUTE, SLOT_MINUTES, DEFAULT_TIMEZONE } from './lib/constants';

interface UserInfo {
  id: number;
  email: string;
  nickname?: string;
  profile_image?: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roomIdFromUrl = searchParams.get('room');

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(roomIdFromUrl);
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['월', '화', '수', '목', '금']);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [copied, setCopied] = useState(false);
  const [inputMode, setInputMode] = useState<'grid' | 'direct'>('grid');
  const [isFreeTimeOpen, setIsFreeTimeOpen] = useState(true);
  const [showScheduleEditModal, setShowScheduleEditModal] = useState(false);
  const [rooms, setRooms] = useState<{ id: string; name: string; members: number; isCreator: boolean }[]>([]);

  // API State
  const [eventData, setEventData] = useState<ChinbaEventResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 인증 상태 초기화 및 자동 갱신
  useEffect(() => {
    const initAuth = async () => {
      // 1. 메모리에 access token이 있는지 확인
      if (hasAccessToken()) {
        const token = getAccessToken();
        if (token) {
          try {
            const user = await getUserInfo(token);
            setUserInfo(user);
            setIsLoggedIn(true);
            return;
          } catch (err) {
            console.error('Failed to get user info with existing token:', err);
            clearAccessToken();
          }
        }
      }

      // 2. Access token이 없으면 refresh token으로 갱신 시도
      try {
        const authStatus = await checkAuthStatus();
        if (authStatus.hasToken) {
          // Refresh token이 있으면 access token 갱신
          const tokenResponse = await refreshAccessToken();
          setAccessToken(tokenResponse.access_token);

          // 사용자 정보 가져오기
          const user = await getUserInfo(tokenResponse.access_token);
          setUserInfo(user);
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Failed to refresh token:', err);
        setIsLoggedIn(false);
        setUserInfo(null);
      }
    };

    initAuth();
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await apiLogout();
      clearAccessToken();
      setIsLoggedIn(false);
      setUserInfo(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Derived data from API response
  const eventInfo = eventData?.event;
  const participants: ChinbaParticipant[] = eventData?.participants || [];
  const heatmap: ChinbaHeatmap = eventData?.heatmap || {};
  const dates: string[] = eventInfo?.dates || [];
  const startMinute = eventInfo?.start_minute ?? DEFAULT_START_MINUTE;
  const endMinute = eventInfo?.end_minute ?? DEFAULT_END_MINUTE;
  const slotMinutes = eventInfo?.slot_minutes ?? SLOT_MINUTES;

  const timeSlots = generateTimeSlotsFromMinutes(startMinute, endMinute, slotMinutes);
  const freeTime: FreeTimeSlot[] = eventData
    ? calculateFreeTimeFromHeatmap(heatmap, dates, startMinute, endMinute, slotMinutes, participants.length)
    : [];

  // Fetch event data
  const fetchEventData = useCallback(async (eventId: string) => {
    setIsLoading(true);
    setError(null);
    const token = getAccessToken();
    try {
      const data = await getEvent(eventId, token || undefined);
      setEventData(data);

      // Set selected slots from my availability
      if (data.me?.availability) {
        const mySlots = new Set<string>();
        Object.entries(data.me.availability).forEach(([date, slotIndexes]) => {
          slotIndexes.forEach((slotIndex) => {
            const minute = data.event.start_minute + slotIndex * data.event.slot_minutes;
            const hours = Math.floor(minute / 60);
            const mins = minute % 60;
            const time = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
            mySlots.add(`${date}T${time}:00`);
          });
        });
        setSelectedSlots(mySlots);
      }
    } catch (err) {
      setError('이벤트를 불러오는데 실패했습니다');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch my rooms
  const fetchRooms = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const response = await getMyEvents(token);
      setRooms(response.events.map(e => ({
        id: e.id,
        name: e.title,
        members: e.members,
        isCreator: e.is_creator,
      })));
    } catch (err) {
      console.error('Failed to fetch rooms', err);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchRooms();
    } else {
      setRooms([]);
    }
  }, [isLoggedIn, fetchRooms]);

  // URL 변경 시 currentRoomId 업데이트 및 데이터 fetch
  useEffect(() => {
    if (roomIdFromUrl) {
      setCurrentRoomId(roomIdFromUrl);
      fetchEventData(roomIdFromUrl);
    } else {
      setCurrentRoomId(null);
      setEventData(null);
    }
  }, [roomIdFromUrl, fetchEventData]);

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCodeInput.trim()) {
      const roomId = roomCodeInput.trim();
      router.push(`?room=${roomId}`);
      setRoomCodeInput('');
    }
  };

  const handleCreateRoom = () => {
    setShowCreateModal(true);
  };

  const handleConfirmCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert('방 이름을 입력해주세요');
      return;
    }

    try {
      // Generate dates for next 7 days
      const today = new Date();
      const newDates: string[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        newDates.push(date.toISOString().split('T')[0]);
      }

      const response = await createEvent({
        title: newRoomName.trim(),
        dates: newDates,
        start_minute: DEFAULT_START_MINUTE,
        end_minute: DEFAULT_END_MINUTE,
        time_zone: DEFAULT_TIMEZONE,
      }, getAccessToken() || undefined);

      router.push(`?room=${response.event_id}`);
      setShowCreateModal(false);
      setNewRoomName('');
      fetchRooms();
    } catch (err: any) {
      console.error('Room creation error:', err);
      const errorMessage = err?.message || '알 수 없는 오류';
      alert(`방 생성에 실패했습니다: ${errorMessage}`);
    }
  };

  const handleSelectRoom = (roomId: string) => {
    router.push(`?room=${roomId}`);
  };

  const handleDeleteRoom = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('정말 이 방을 삭제(또는 나가기) 하시겠습니까?')) {
      return;
    }

    const token = getAccessToken();
    if (!token) return;

    try {
      await deleteEvent(roomId, token);

      // If currently viewing this room, go home
      if (currentRoomId === roomId) {
        router.push('/');
      }

      fetchRooms();
    } catch (err) {
      console.error('Failed to delete room', err);
      alert('방 삭제/나가기에 실패했습니다');
    }
  };

  const handleCopyLink = useCallback(() => {
    if (!currentRoomId) return;
    const link = `${window.location.origin}/?room=${currentRoomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentRoomId]);

  const handleSaveAvailability = async () => {
    const token = getAccessToken();
    if (!currentRoomId || !token || !eventInfo) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      // Convert selectedSlots to slot indexes grouped by date
      const availabilityByDate: Record<string, number[]> = {};

      selectedSlots.forEach((slot) => {
        const [date, time] = slot.split('T');
        const [hours, mins] = time.replace(':00', '').split(':').map(Number);
        const minute = hours * 60 + mins;
        const slotIndex = Math.floor((minute - eventInfo.start_minute) / eventInfo.slot_minutes);

        if (!availabilityByDate[date]) {
          availabilityByDate[date] = [];
        }
        availabilityByDate[date].push(slotIndex);
      });

      // Save all at once using bulk API (now standardized as updateMyAvailability)
      await updateMyAvailability(currentRoomId, { availability: availabilityByDate }, token);

      // Refresh data
      await fetchEventData(currentRoomId);
      alert('저장되었습니다');
    } catch (err) {
      alert('저장에 실패했습니다');
      console.error(err);
    }
  };

  const handleOpenScheduleEdit = () => {
    if (!isLoggedIn) {
      alert('일정을 수정하려면 로그인이 필요합니다');
      return;
    }
    setShowScheduleEditModal(true);
  };

  const handleJoinEvent = async () => {
    const token = getAccessToken();
    if (!currentRoomId || !token) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      await joinEvent(currentRoomId, token);
      await fetchEventData(currentRoomId);
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  // Join event automatically when logged in and viewing an event
  useEffect(() => {
    if (isLoggedIn && getAccessToken() && currentRoomId && eventData && !eventData.me?.joined) {
      handleJoinEvent();
    }
  }, [isLoggedIn, currentRoomId, eventData]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* 상단 헤더 */}
      {/* 상단 헤더 */}
      <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 사이드바 */}
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
            <div className="fixed left-0 top-14 bottom-0 z-50 h-[calc(100vh-3.5rem)]">
              <IntegratedSidebar
                isLoggedIn={isLoggedIn}
                userInfo={userInfo}
                onLogout={handleLogout}
                currentRoomId={currentRoomId}
                participants={participants}
                freeTime={freeTime}
                hoveredMember={hoveredMember}
                onMemberHover={setHoveredMember}
                onCreateRoom={handleCreateRoom}
                onSelectRoom={handleSelectRoom}
                onDeleteRoom={handleDeleteRoom}
                rooms={rooms}
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
                      {isLoading ? '로딩 중...' : (eventInfo?.title || currentRoomId)}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      {participants.length}명 참여 중
                    </p>
                    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
                      onClick={() => alert('이 기능은 아직 준비중입니다')}
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
                        placeholder="방 코드를 입력하세요"
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
                      onClick={() => alert('이 기능은 아직 준비중입니다')}
                      disabled={!isLoggedIn}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload size={16} />
                      시간표 업로드
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 모바일: 모두 가능한 시간 */}
            {currentRoomId && (
              <div className="mb-6 lg:hidden">
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setIsFreeTimeOpen(!isFreeTimeOpen)}
                    className="flex-1 sm:flex-initial flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    <Clock size={16} />
                    <span className="text-sm font-medium">모두 가능한 시간</span>
                    {isFreeTimeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  <button
                    onClick={handleOpenScheduleEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Pencil size={16} />
                    <span className="text-sm font-medium">일정 수정</span>
                  </button>
                </div>

                {isFreeTimeOpen && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    {freeTime.length > 0 ? (
                      <div className="space-y-3">
                        {(() => {
                          const groupedByDay = freeTime.reduce((acc, slot) => {
                            if (!acc[slot.day]) acc[slot.day] = [];
                            acc[slot.day].push(slot);
                            return acc;
                          }, {} as Record<string, typeof freeTime>);

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

            {/* 웹: 2열 그리드 레이아웃 */}
            <div className={currentRoomId ? "grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6" : ""}>
              {/* 왼쪽 사이드 패널 */}
              {currentRoomId && (
                <div className="hidden lg:flex lg:flex-col gap-6">
                  {/* 모두 가능한 시간 */}
                  <div>
                    <button
                      onClick={() => setIsFreeTimeOpen(!isFreeTimeOpen)}
                      className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-colors mb-3"
                    >
                      <Clock size={16} />
                      <span className="text-sm font-medium">모두 가능한 시간</span>
                      {isFreeTimeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {isFreeTimeOpen && (
                      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        {freeTime.length > 0 ? (
                          <div className="space-y-2">
                            {(() => {
                              const groupedByDay = freeTime.reduce((acc, slot) => {
                                if (!acc[slot.day]) acc[slot.day] = [];
                                acc[slot.day].push(slot);
                                return acc;
                              }, {} as Record<string, typeof freeTime>);

                              const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];

                              return dayOrder.map((day) => {
                                const slots = groupedByDay[day];
                                if (!slots || slots.length === 0) return null;

                                return (
                                  <div key={day} className="space-y-1">
                                    <div className="text-xs font-semibold text-gray-700">{day}</div>
                                    <div className="flex flex-wrap gap-1">
                                      {slots.map((slot, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-xs"
                                        >
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                          <span className="text-emerald-700">
                                            {slot.startTime}-{slot.endTime}
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
                          <p className="text-xs text-gray-400 italic text-center py-2">
                            모두 가능한 시간이 없습니다
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 참여 멤버 */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Users size={16} />
                        참여 멤버
                      </h2>
                      <button
                        onClick={handleOpenScheduleEdit}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
                      >
                        <Pencil size={12} />
                        일정 수정
                      </button>
                    </div>
                    {participants.length > 0 ? (
                      <div className="space-y-2">
                        {participants.map((member) => (
                          <div
                            key={member.user_id}
                            onMouseEnter={() => setHoveredMember(member.user_id)}
                            onMouseLeave={() => setHoveredMember(null)}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer ${hoveredMember === member.user_id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                              }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                              {member.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{member.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-xs text-gray-400">
                        {isLoggedIn ? '참여자가 없습니다' : '로그인하여 참여하세요'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 오른쪽: 시간표 영역 */}
              <div>
                <div>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold mb-2">팀 일정 현황</h2>
                    <p className="text-sm text-gray-500">
                      {currentRoomId
                        ? '참여 멤버들의 일정을 확인하세요'
                        : '방 코드를 입력하면 모임 시간을 정할 수 있어요'}
                    </p>
                  </div>

                  {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-gray-500">로딩 중...</div>
                    </div>
                  ) : (
                    <TimeTable
                      dates={dates}
                      selectedDays={selectedDays}
                      timeSlots={timeSlots}
                      selectedSlots={selectedSlots}
                      heatmap={heatmap}
                      totalParticipants={participants.length || 1}
                      hoveredMember={hoveredMember ? String(hoveredMember) : null}
                      showHeatmap={!!currentRoomId}
                      disabled={true}
                      onSelectedDaysChange={setSelectedDays}
                      onSelectedSlotsChange={setSelectedSlots}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 방 생성 모달 */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900">새 방 만들기</h2>
            <p className="text-sm text-gray-600 mb-6">
              모임 시간을 조율할 방을 만들어보세요
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                방 이름
              </label>
              <input
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="예: 팀 회의 일정 조율"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleConfirmCreateRoom();
                  }
                }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewRoomName('');
                }}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleConfirmCreateRoom}
                className="flex-1 px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                방 생성하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 일정 수정 모달 */}
      {showScheduleEditModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowScheduleEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">내 일정 입력하기</h2>
                <p className="text-sm text-gray-500 mt-1">
                  드래그하여 여러 시간대를 한번에 선택하세요
                </p>
              </div>
              <button
                onClick={() => setShowScheduleEditModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 pt-4">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setInputMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${inputMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  그리드
                </button>
                <button
                  onClick={() => setInputMode('direct')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${inputMode === 'direct'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                  직접 입력
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {inputMode === 'grid' ? (
                <TimeTable
                  dates={dates}
                  selectedDays={selectedDays}
                  timeSlots={timeSlots}
                  selectedSlots={selectedSlots}
                  heatmap={heatmap}
                  totalParticipants={participants.length || 1}
                  hoveredMember={hoveredMember ? String(hoveredMember) : null}
                  showHeatmap={!!currentRoomId}
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

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowScheduleEditModal(false)}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  handleSaveAvailability();
                  setShowScheduleEditModal(false);
                }}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
