'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAccessToken } from '@/app/lib/tokenStore';

/**
 * Google OAuth 콜백 핸들러
 * 백엔드에서 리다이렉트된 후 access_token을 받아서 저장하고 메인 페이지로 이동
 */
export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const accessToken = searchParams.get('access_token');
        const error = searchParams.get('error');

        if (error) {
            // 로그인 취소 또는 에러 발생
            console.error('Auth error:', error);
            alert('로그인에 실패했습니다.');
            router.push('/');
            return;
        }

        if (accessToken) {
            // Access Token을 메모리에 저장
            setAccessToken(accessToken);

            // 메인 페이지로 리다이렉트
            router.push('/');
        } else {
            // 토큰이 없으면 메인 페이지로
            router.push('/');
        }
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">로그인 처리 중...</p>
            </div>
        </div>
    );
}
