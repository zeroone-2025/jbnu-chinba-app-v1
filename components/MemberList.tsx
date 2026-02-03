'use client';

import { Users } from 'lucide-react';
import type { Participant } from '../app/types';

interface MemberListProps {
  participants: Participant[];
  hoveredMember: number | null;
  onMemberHover: (id: number | null) => void;
  isLoggedIn: boolean;
}

export default function MemberList({
  participants,
  hoveredMember,
  onMemberHover,
  isLoggedIn,
}: MemberListProps) {
  return (
    <div>
      <h2 className="text-sm font-medium text-gray-600 mb-3 flex items-center gap-2">
        <Users size={16} />
        참여 멤버
      </h2>
      {participants.length > 0 ? (
        <div className="space-y-2">
          {participants.map((member) => (
            <div
              key={member.participant_id}
              onMouseEnter={() => onMemberHover(member.participant_id)}
              onMouseLeave={() => onMemberHover(null)}
              className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                hoveredMember === member.participant_id
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
  );
}
