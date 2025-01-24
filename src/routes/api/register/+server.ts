import type { RequestHandler } from '@sveltejs/kit';
import { User } from '$lib/entities/User';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '$lib/ormconfig';
import { createTokens } from '$lib/auth/jwt';

function isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:;<>,.?/~`]).{8,64}$/;
    return passwordRegex.test(password);
}

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { email, nickname, password } = await request.json();

        if (!email || !nickname || !password) {
            return new Response(JSON.stringify({ success: false, message: '모든 필드를 입력하세요.' }), { status: 400 });
        }

        // ✅ 닉네임 유효성 검사
        const nicknameRegex = /^[ㄱ-ㅎ가-힣a-zA-Z0-9]+$/;
        if (!nicknameRegex.test(nickname) || nickname.length < 2 || nickname.length > 20) {
            return new Response(JSON.stringify({ success: false, message: '닉네임은 한글, 영어, 숫자로만 구성되며 2~20자여야 합니다.' }), { status: 400 });
        }

        // ✅ 비밀번호 유효성 검사
        if (!isValidPassword(password)) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: '비밀번호는 최소 8자 이상, 최대 64자이며, 영문 대소문자, 숫자, 특수문자를 포함해야 합니다.' 
            }), { status: 400 });
        }

        // ✅ 닉네임 및 이메일 중복 확인
        const userDB = AppDataSource.getRepository(User);
        const existingUser = await userDB.findOne({ where: [{ username: nickname }] });

        if (existingUser) {
            return new Response(JSON.stringify({ success: false, message: '이미 사용 중인 이메일 또는 닉네임입니다.' }), { status: 400 });
        }

        // ✅ 비밀번호 해싱
        const hashedPassword = await bcrypt.hash(password, 12);

        // ✅ 새 사용자 생성
        const newUser = userDB.create({
            email: email,
            username: nickname,
            password: hashedPassword,
        });
        await userDB.save(newUser);

        const { accessToken, refreshTokenCookie } = createTokens(newUser);

        return new Response(JSON.stringify({ success: true, message: "로그인 성공!", accessToken }), {
            status: 200,
            headers: new Headers({ "Set-Cookie": refreshTokenCookie }),
        });
} catch (error) {
        console.error('회원가입 오류:', error);
        return new Response(JSON.stringify({ success: false, message: '서버 오류가 발생했습니다.' }), { status: 500 });
    }
};
