'use client';

import { Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

export default function Header({ isSidebarOpen, setIsSidebarOpen }: HeaderProps) {
    const router = useRouter();

    return (
        <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 bg-white sticky top-0 z-50 shadow-sm">
            <div className="flex items-center gap-6">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                    aria-label="사이드바 토글"
                >
                    <Menu size={18} />
                </button>

                <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-sm">
                        친
                    </div>
                    <span className="text-lg font-semibold tracking-tight">친바</span>
                </div>
            </div>

            <nav className="flex items-center gap-1">
                <button
                    onClick={() => router.push('/')}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 transition-all"
                >
                    친바
                </button>
                {/* <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all">
                    모이자
                </button> */}
            </nav>
        </header>
    );
}
