'use client';

import { Users, Plus, Trash2 } from 'lucide-react';
import type { ChinbaParticipant, FreeTimeSlot } from '../app/types';
import { API_BASE_URL } from '../app/lib/constants';

interface RoomInfo {
  id: string;
  name: string;
  members: number;
  isCreator: boolean;
}

interface UserInfo {
  email: string;
  nickname?: string;
  profile_image?: string;
}

interface IntegratedSidebarProps {
  isLoggedIn: boolean;
  userInfo: UserInfo | null;
  onLogout: () => void;
  currentRoomId: string | null;
  participants: ChinbaParticipant[];
  freeTime: FreeTimeSlot[];
  hoveredMember: number | null;
  onMemberHover: (id: number | null) => void;
  onCreateRoom: () => void;
  onSelectRoom: (roomId: string) => void;
  onDeleteRoom: (roomId: string, e: React.MouseEvent) => void;
  rooms?: RoomInfo[];
}

export default function IntegratedSidebar({
  isLoggedIn,
  userInfo,
  onLogout,
  currentRoomId,
  participants,
  freeTime,
  hoveredMember,
  onMemberHover,
  onCreateRoom,
  onSelectRoom,
  onDeleteRoom,
  rooms,
}: IntegratedSidebarProps) {

  const handleGoogleLogin = () => {
    // 백엔드 서버사이드 OAuth flow로 리다이렉트
    window.location.href = `${API_BASE_URL}/auth/google/login?platform=web`;
  };

  const displayName = userInfo?.nickname || userInfo?.email?.split('@')[0] || '사용자';
  const initial = displayName[0].toUpperCase();

  return (
    <aside className="w-64 h-full border-r border-gray-200 bg-white flex flex-col overflow-hidden shadow-xl">
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* 로그인 박스 */}
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
          {!isLoggedIn ? (
            <div className="space-y-3">
              <p className="text-xs text-blue-700 text-center">
                로그인하고 내 일정을 관리하세요
              </p>
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-gray-50 transition-colors"
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
                {userInfo?.profile_image ? (
                  <img
                    src={userInfo.profile_image}
                    alt={displayName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium">
                    {initial}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{displayName}</p>
                  <p className="text-xs text-gray-500 truncate">{userInfo?.email}</p>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="w-full py-1.5 rounded-md text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>

        {/* 방 생성 버튼 */}
        <button
          onClick={onCreateRoom}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          방 생성
        </button>

        {/* 방 리스트 */}
        <div className="space-y-1">
          <div className="px-2 py-1.5">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              내 방
            </span>
          </div>
          {!isLoggedIn ? (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-gray-500">
                방 리스트 확인은<br />
                로그인 후 이용가능합니다
              </p>
            </div>
          ) : rooms && rooms.length > 0 ? (
            <>
              {rooms.map((room: RoomInfo) => (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg transition-colors text-left ${currentRoomId === room.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-100'
                    }`}
                >
                  <div className="w-6 h-6 rounded-md bg-gray-200 flex items-center justify-center text-xs">
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate font-medium">{room.name}</p>
                    <p className="text-xs text-gray-500">{room.members}명</p>
                  </div>
                  {room.isCreator ? (
                    <div
                      onClick={(e) => onDeleteRoom(room.id, e)}
                      className="p-1.5 rounded-md text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </div>
                  ) : (
                    <div
                      onClick={(e) => onDeleteRoom(room.id, e)}
                      className="px-2 py-1 rounded-md text-xs font-medium text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      나가기
                    </div>
                  )}
                </button>
              ))}
            </>
          ) : (
            <div className="text-center py-8 px-4">
              <p className="text-sm text-gray-500">
                참여중인 방(모임)이<br />
                없습니다
              </p>
            </div>
          )}
        </div>

        {/* 현재 방 정보 (방 접속 시에만 표시) */}
        {currentRoomId && (
          <>
            <div className="border-t border-gray-200 pt-4 lg:hidden">
              {/* 참여 멤버 - 모바일에서만 표시 */}
              <div className="mb-4">
                <h2 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
                  <Users size={16} />
                  참여 멤버
                </h2>
                {participants.length > 0 ? (
                  <div className="space-y-2">
                    {participants.map((member) => (
                      <div
                        key={member.user_id}
                        onMouseEnter={() => onMemberHover(member.user_id)}
                        onMouseLeave={() => onMemberHover(null)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${hoveredMember === member.user_id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                          }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                          {member.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{member.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm text-gray-400">
                    {isLoggedIn ? '참여자가 없습니다' : '로그인하여 참여하세요'}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
