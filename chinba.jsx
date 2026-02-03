import React, { useState, useCallback } from 'react';

// 친바 - 시간 조율 서비스 UI/UX 디자인
const ChinbaApp = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [selectedDays, setSelectedDays] = useState(['월', '화', '수']);
    const [selectedTimeSlots, setSelectedTimeSlots] = useState(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [activeView, setActiveView] = useState('room'); // 'create' | 'room'
    const [hoveredMember, setHoveredMember] = useState(null);

    // 시간 슬롯 데이터
    const timeSlots = [];
    for (let h = 9; h <= 22; h++) {
        timeSlots.push(`${h}:00`);
        timeSlots.push(`${h}:30`);
    }

    const days = ['월', '화', '수', '목', '금', '토', '일'];

    // 샘플 멤버 데이터
    const members = [
        { id: 1, name: '김민수', avatar: '🧑', availability: new Set(['월-10:00', '월-10:30', '화-14:00', '수-11:00']) },
        { id: 2, name: '이서연', avatar: '👩', availability: new Set(['월-10:00', '월-10:30', '월-11:00', '화-14:00']) },
        { id: 3, name: '박지훈', avatar: '👨', availability: new Set(['월-10:30', '수-11:00', '수-11:30']) },
    ];

    // 프리타임 계산 (모두가 가능한 시간)
    const calculateFreeTime = () => {
        const allSlots = new Map();
        members.forEach(member => {
            member.availability.forEach(slot => {
                allSlots.set(slot, (allSlots.get(slot) || 0) + 1);
            });
        });
        return Array.from(allSlots.entries())
            .filter(([_, count]) => count === members.length)
            .map(([slot]) => slot);
    };

    const freeTime = calculateFreeTime();

    // 드래그 선택 핸들러
    const handleMouseDown = (day, time) => {
        setIsDragging(true);
        const key = `${day}-${time}`;
        setSelectedTimeSlots(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) newSet.delete(key);
            else newSet.add(key);
            return newSet;
        });
    };

    const handleMouseEnter = (day, time) => {
        if (isDragging) {
            const key = `${day}-${time}`;
            setSelectedTimeSlots(prev => new Set([...prev, key]));
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    // 히트맵 색상 계산
    const getHeatmapColor = (day, time) => {
        const key = `${day}-${time}`;
        let count = 0;
        members.forEach(m => { if (m.availability.has(key)) count++; });

        if (hoveredMember) {
            const member = members.find(m => m.id === hoveredMember);
            if (member?.availability.has(key)) return 'bg-amber-400';
            return 'bg-slate-800/30';
        }

        if (count === 0) return 'bg-slate-800/30';
        if (count === 1) return 'bg-emerald-900/60';
        if (count === 2) return 'bg-emerald-600/70';
        return 'bg-emerald-400'; // 모두 가능
    };

    // 샘플 방 리스트
    const rooms = [
        { id: 1, name: '2월 스터디 모임', members: 5, lastActive: '2시간 전' },
        { id: 2, name: '프로젝트 킥오프', members: 3, lastActive: '어제' },
        { id: 3, name: '동아리 정기모임', members: 8, lastActive: '3일 전' },
    ];

    return (
        <div
            className="min-h-screen bg-slate-950 text-slate-100 flex flex-col"
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif" }}
        >
            {/* 상단 헤더 */}
            <header className="h-14 border-b border-slate-800/60 flex items-center justify-between px-4 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    {/* 사이드바 토글 */}
                    <button
                        onClick={() => setSidebarOpen(!isSidebarOpen)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-800 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        </svg>
                    </button>

                    {/* 로고 */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-slate-900 text-sm">
                            친
                        </div>
                        <span className="text-lg font-semibold tracking-tight">친바</span>
                    </div>
                </div>

                {/* 네비게이션 */}
                <nav className="flex items-center gap-1">
                    <button className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition-all">
                        친바
                    </button>
                    <button className="px-4 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-300 hover:bg-slate-800/30 transition-all">
                        모이자
                    </button>
                </nav>

                {/* 방 생성 버튼 */}
                <button
                    onClick={() => setActiveView('create')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-medium text-sm hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/20"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    방 생성
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* 사이드바 (노션 스타일) */}
                <aside
                    className={`${isSidebarOpen ? 'w-64' : 'w-0'} border-r border-slate-800/60 bg-slate-900/40 flex flex-col transition-all duration-300 overflow-hidden`}
                >
                    <div className="flex-1 overflow-y-auto p-3">
                        {/* 로그인 박스 */}
                        <div className="mb-4 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                            {!isLoggedIn ? (
                                <div className="space-y-3">
                                    <p className="text-xs text-slate-400 text-center">로그인하고 내 일정을 관리하세요</p>
                                    <button
                                        onClick={() => setIsLoggedIn(true)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-medium hover:bg-slate-100 transition-colors"
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Google로 계속하기
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                            김
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">김민수</p>
                                            <p className="text-xs text-slate-500 truncate">minsu@gmail.com</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsLoggedIn(false)}
                                        className="w-full py-1.5 rounded-md text-xs text-slate-400 hover:text-slate-300 hover:bg-slate-700/50 transition-colors"
                                    >
                                        로그아웃
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 방 리스트 */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between px-2 py-1.5">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">내 방</span>
                                <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-slate-700/50 text-slate-500 hover:text-slate-300">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                </button>
                            </div>

                            {rooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => setActiveView('room')}
                                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800/50 transition-colors group text-left"
                                >
                                    <div className="w-6 h-6 rounded-md bg-slate-700/50 flex items-center justify-center text-xs">
                                        📅
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{room.name}</p>
                                        <p className="text-xs text-slate-500">{room.members}명 · {room.lastActive}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* 메인 콘텐츠 */}
                <main className="flex-1 overflow-y-auto">
                    {activeView === 'create' ? (
                        /* 방 생성 화면 */
                        <div className="max-w-2xl mx-auto p-8">
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold mb-2">새 방 만들기</h1>
                                <p className="text-slate-400">일정을 조율할 방을 만들어보세요</p>
                            </div>

                            <div className="space-y-6">
                                {/* 방 이름 */}
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-300">방 이름</label>
                                    <input
                                        type="text"
                                        placeholder="예: 2월 스터디 모임"
                                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-600"
                                    />
                                </div>

                                {/* 요일 선택 */}
                                <div>
                                    <label className="block text-sm font-medium mb-3 text-slate-300">요일 선택</label>
                                    <div className="flex gap-2">
                                        {days.map(day => (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    setSelectedDays(prev =>
                                                        prev.includes(day)
                                                            ? prev.filter(d => d !== day)
                                                            : [...prev, day]
                                                    );
                                                }}
                                                className={`w-12 h-12 rounded-xl font-medium transition-all ${selectedDays.includes(day)
                                                    ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/30'
                                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 시간 범위 */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-300">시작 시간</label>
                                        <select className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 outline-none appearance-none cursor-pointer">
                                            {[...Array(15)].map((_, i) => (
                                                <option key={i} value={i + 8}>{i + 8}:00</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-300">종료 시간</label>
                                        <select className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 outline-none appearance-none cursor-pointer">
                                            {[...Array(15)].map((_, i) => (
                                                <option key={i} value={i + 9}>{i + 9}:00</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* 생성 버튼 */}
                                <button
                                    onClick={() => setActiveView('room')}
                                    className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold text-lg hover:from-amber-400 hover:to-orange-400 transition-all shadow-xl shadow-amber-500/20"
                                >
                                    방 생성하기
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* 방 상세 화면 */
                        <div className="h-full flex">
                            {/* 왼쪽: 멤버 & 프리타임 */}
                            <div className="w-72 border-r border-slate-800/60 p-4 space-y-6 overflow-y-auto">
                                {/* 방 정보 */}
                                <div>
                                    <h1 className="text-xl font-bold mb-1">2월 스터디 모임</h1>
                                    <p className="text-sm text-slate-500">3명 참여 중</p>
                                </div>

                                {/* 참여 멤버 */}
                                <div>
                                    <h2 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        참여 멤버
                                    </h2>
                                    <div className="space-y-2">
                                        {members.map(member => (
                                            <div
                                                key={member.id}
                                                onMouseEnter={() => setHoveredMember(member.id)}
                                                onMouseLeave={() => setHoveredMember(null)}
                                                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${hoveredMember === member.id
                                                    ? 'bg-amber-500/10 border border-amber-500/30'
                                                    : 'bg-slate-800/30 border border-transparent hover:bg-slate-800/50'
                                                    }`}
                                            >
                                                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-lg">
                                                    {member.avatar}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{member.name}</p>
                                                    <p className="text-xs text-slate-500">{member.availability.size}개 시간대 가능</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 프리타임 */}
                                <div>
                                    <h2 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                            <polyline points="22 4 12 14.01 9 11.01" />
                                        </svg>
                                        모두 가능한 시간
                                    </h2>
                                    {freeTime.length > 0 ? (
                                        <div className="space-y-2">
                                            {freeTime.map(slot => (
                                                <div
                                                    key={slot}
                                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30"
                                                >
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                                                    <span className="text-sm text-emerald-300">{slot.replace('-', ' ')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">모두 가능한 시간이 없습니다</p>
                                    )}
                                </div>

                                {/* 공유 링크 */}
                                <div className="pt-4 border-t border-slate-800/60">
                                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 transition-colors">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                        </svg>
                                        초대 링크 복사
                                    </button>
                                </div>
                            </div>

                            {/* 오른쪽: 시간 선택 그리드 */}
                            <div className="flex-1 p-6 overflow-auto">
                                <div className="mb-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold mb-1">내 가능 시간 선택</h2>
                                        <p className="text-sm text-slate-500">드래그하여 여러 시간대를 한번에 선택하세요</p>
                                    </div>
                                    <button className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-900 font-medium hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
                                        저장하기
                                    </button>
                                </div>

                                {/* 요일 드롭다운 선택 */}
                                <div className="mb-4 flex items-center gap-3">
                                    <span className="text-sm text-slate-400">표시할 요일:</span>
                                    <div className="flex gap-1">
                                        {days.map(day => (
                                            <button
                                                key={day}
                                                onClick={() => {
                                                    setSelectedDays(prev =>
                                                        prev.includes(day)
                                                            ? prev.filter(d => d !== day)
                                                            : [...prev, day]
                                                    );
                                                }}
                                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${selectedDays.includes(day)
                                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                                    : 'bg-slate-800/30 text-slate-500 hover:text-slate-300'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* 시간 그리드 */}
                                <div className="bg-slate-900/50 rounded-2xl border border-slate-800/60 overflow-hidden">
                                    {/* 요일 헤더 */}
                                    <div className="grid border-b border-slate-800/60" style={{ gridTemplateColumns: `60px repeat(${selectedDays.length}, 1fr)` }}>
                                        <div className="p-3 text-center text-xs text-slate-500 font-medium bg-slate-800/30">
                                            시간
                                        </div>
                                        {selectedDays.map(day => (
                                            <div key={day} className="p-3 text-center text-sm font-semibold bg-slate-800/30 border-l border-slate-800/40">
                                                {day}
                                            </div>
                                        ))}
                                    </div>

                                    {/* 시간 슬롯 */}
                                    <div className="max-h-96 overflow-y-auto">
                                        {timeSlots.map((time, idx) => (
                                            <div
                                                key={time}
                                                className="grid border-b border-slate-800/30 last:border-b-0"
                                                style={{ gridTemplateColumns: `60px repeat(${selectedDays.length}, 1fr)` }}
                                            >
                                                <div className={`px-2 py-1.5 text-xs text-slate-500 flex items-center justify-center ${time.endsWith(':00') ? 'font-medium' : 'text-slate-600'
                                                    }`}>
                                                    {time.endsWith(':00') ? time : ''}
                                                </div>
                                                {selectedDays.map(day => {
                                                    const key = `${day}-${time}`;
                                                    const isSelected = selectedTimeSlots.has(key);
                                                    return (
                                                        <div
                                                            key={key}
                                                            onMouseDown={() => handleMouseDown(day, time)}
                                                            onMouseEnter={() => handleMouseEnter(day, time)}
                                                            className={`h-7 border-l border-slate-800/40 cursor-pointer transition-colors ${isSelected
                                                                ? 'bg-amber-500'
                                                                : getHeatmapColor(day, time)
                                                                } hover:brightness-110`}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 범례 */}
                                <div className="mt-4 flex items-center gap-6 text-xs text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-amber-500" />
                                        <span>내 선택</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-emerald-400" />
                                        <span>모두 가능</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-emerald-600/70" />
                                        <span>2명 가능</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-emerald-900/60" />
                                        <span>1명 가능</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ChinbaApp;