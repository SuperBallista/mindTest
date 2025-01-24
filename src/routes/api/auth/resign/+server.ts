import { json } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';
import type { RequestEvent } from '@sveltejs/kit';

export const DELETE = async (event: RequestEvent) => {
    try {
       const userRepo = AppDataSource.getRepository(User);

        // ✅ DB에서 사용자 삭제
        await userRepo.delete({ id: event.locals.user.id });

        return json({ success: true, message: '계정이 삭제되었습니다.' });
    } catch (error) {
        console.error('❌ 탈퇴 오류:', error);
        return json({ success: false, message: '서버 오류' }, { status: 500 });
    }
};
