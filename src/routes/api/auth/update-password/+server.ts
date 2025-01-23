import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';
import bcrypt from 'bcrypt';

function isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:;<>,.?/~`]).{8,64}$/;
    return passwordRegex.test(password);
}

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        if (!locals.user) {
            return json({ success: false, error: '로그인이 필요합니다.' }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return json({ success: false, error: '현재 비밀번호와 새 비밀번호를 입력하세요.' }, { status: 400 });
        }

        if (!isValidPassword(newPassword)) {
            return json({ 
                success: false, 
                error: '비밀번호는 최소 8자 이상, 최대 64자이며, 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.' 
            }, { status: 400 });
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ id: locals.user.id });

        if (!user) {
            return json({ success: false, error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
        }

        // ✅ 현재 비밀번호 확인
        const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password as string);
        if (!isPasswordCorrect) {
            return json({ success: false, error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 400 });
        }

        // ✅ 새로운 비밀번호 암호화 후 저장
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await userRepository.save(user);

        return json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });

    } catch (error) {
        console.error('❌ 비밀번호 변경 중 오류 발생:', error);
        return json({ success: false, error: '서버 오류 발생' }, { status: 500 });
    }
};
