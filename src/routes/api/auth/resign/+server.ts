import { json } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';
import { verifyAuth } from '$lib/server/auth'; // ✅ JWT 인증 확인
import type { RequestEvent } from '@sveltejs/kit';

export const DELETE = async (event: RequestEvent) => {
    try {
        const user = await verifyAuth(event); // ✅ RequestEvent 전체 전달
        if (!user) {
            return json({ success: false, message: '인증 실패' }, { status: 401 });
        }

        const userRepo = AppDataSource.getRepository(User);

        // ✅ DB에서 사용자 삭제
        await userRepo.delete({ id: user.id });

        return json({ success: true, message: '계정이 삭제되었습니다.' });
    } catch (error) {
        console.error('❌ 탈퇴 오류:', error);
        return json({ success: false, message: '서버 오류' }, { status: 500 });
    }
};
