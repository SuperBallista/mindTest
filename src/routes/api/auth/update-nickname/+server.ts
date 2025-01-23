import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        if (!locals.user) {
            return new Response(JSON.stringify({ success: false, message: '로그인이 필요합니다.' }), { status: 401 });
        }

        const { newNickname } = await request.json();
        const userId = locals.user.id;

        // ✅ 닉네임 유효성 검사
        const nicknameRegex = /^[ㄱ-ㅎ가-힣a-zA-Z0-9]+$/;
        if (!nicknameRegex.test(newNickname) || newNickname.length < 2 || newNickname.length > 20) {
            return new Response(JSON.stringify({ success: false, message: '닉네임은 한글, 영어, 숫자로만 구성되며 2~20자여야 합니다.' }), { status: 400 });
        }

        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user) {
            return new Response(JSON.stringify({ success: false, message: '사용자를 찾을 수 없습니다.' }), { status: 404 });
        }

        // ✅ 마지막 닉네임 변경 확인 (90일 제한)
        const now = new Date();
        if (user.lastNicknameChange) {
            const daysSinceLastChange = Math.floor((now.getTime() - new Date(user.lastNicknameChange).getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceLastChange < 90) {
                return new Response(JSON.stringify({ 
                    success: false, 
                    message: `닉네임 변경은 90일 후에 가능합니다. (${90 - daysSinceLastChange}일 남음)` 
                }), { status: 400 });
            }
        }

        // ✅ 닉네임 중복 확인
        const existingUser = await userRepo.findOne({ where: { username: newNickname } });
        if (existingUser) {
            return new Response(JSON.stringify({ success: false, message: '이미 사용 중인 닉네임입니다.' }), { status: 400 });
        }

        // ✅ 닉네임 업데이트
        user.username = newNickname;
        user.lastNicknameChange = now;
        await userRepo.save(user);

        return new Response(JSON.stringify({ success: true, message: '닉네임이 변경되었습니다.' }), { status: 200 });

    } catch (error) {
        console.error('닉네임 변경 오류:', error);
        return new Response(JSON.stringify({ success: false, message: '서버 오류가 발생했습니다.' }), { status: 500 });
    }
};
