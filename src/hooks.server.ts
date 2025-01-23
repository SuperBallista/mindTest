import type { Handle } from '@sveltejs/kit';
import { verifyRefreshToken, verifyToken } from '$lib/utils/auth'; // ✅ 토큰 검증 및 재발급 함수
import { json } from '@sveltejs/kit';
import { startCleanupTask } from '$lib/utils/deleteStart';


console.log("🔄 DB 및 스토리지 정리 작업 시작...");
startCleanupTask();

// ✅ 인증 미들웨어 설정
export const handle: Handle = async ({ event, resolve }) => {
    const { url, request, cookies } = event;
    
    console.log("📌 미들웨어 실행됨:", url.pathname);

    if (url.pathname.startsWith('/api/auth/')) {
        console.log("🔑 인증 미들웨어 실행 중:", url.pathname);

        let token = request.headers.get('Authorization')?.split('Bearer ')[1];

        try {
            console.log("🔍 받은 액세스 토큰:", token); // ✅ 토큰 로그 추가
            if (!token) throw new Error("🔑 액세스 토큰 없음");

            const user = await verifyToken(token);
            console.log("✅ 유저 인증 성공:", user); // ✅ 유저 정보 확인
            event.locals.user = user; 
        } catch (error) {
            console.warn("❌ 액세스 토큰 검증 실패:", error);

            const refreshToken = cookies.get('refreshToken');
            console.log("🔍 받은 리프레시 토큰:", refreshToken); // ✅ 리프레시 토큰 로그 추가

            if (!refreshToken) {
                console.error("🔐 리프레시 토큰 없음");
                return json({ error: 'Unauthorized: No token provided' }, { status: 401 });
            }

            try {
                const newAccessToken = await verifyRefreshToken(refreshToken);
                console.log("🔄 새 액세스 토큰 발급:", newAccessToken); // ✅ 새로운 액세스 토큰 로그 추가
                if (newAccessToken === "none") throw new Error("❌ 리프레시 토큰 검증 실패");

                const user = await verifyToken(newAccessToken);
                console.log("✅ 새 액세스 토큰으로 유저 인증 성공:", user); // ✅ 유저 정보 확인
                event.locals.user = user; 
                
                const response = await resolve(event);
                
                if (newAccessToken) {
                    console.log("✅ 새 액세스 토큰 헤더에 추가됨"); // ✅ 헤더 추가 확인
                    response.headers.set('Authorization', `Bearer ${newAccessToken}`);
                }
                return response;
            } catch (refreshError) {
                console.error("❌ 리프레시 토큰 검증 실패:", refreshError);
                return json({ error: 'Unauthorized: Invalid refresh token' }, { status: 401 });
            }
        }
    }

    const response = await resolve(event);

    return response;
};
