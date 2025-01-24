import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';
import bcrypt from 'bcrypt';
import { createTokens } from '$lib/auth/jwt';

export const POST: RequestHandler = async ({ request }) => {

    try {
        const { account, password } = await request.json();

        if (!account || !password) {
            return new Response(JSON.stringify({ success: false, message: '아이디와 비밀번호를 입력하세요.' }), { status: 400 });
        }

        // ✅ 사용자 찾기
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { email: account } });

        if (!user) {
            return new Response(JSON.stringify({ success: false, message: '존재하지 않는 계정입니다.' }), { status: 401 });
        }

        // ✅ 비밀번호 검증
        const isMatch = await bcrypt.compare(password, String(user.password));
        if (!isMatch) {
            return new Response(JSON.stringify({ success: false, message: '비밀번호가 틀렸습니다.' }), { status: 401 });
        }

        const { accessToken, refreshTokenCookie } = createTokens(user);

        return new Response(JSON.stringify({ success: true, message: "로그인 성공!", accessToken }), {
            status: 200,
            headers: new Headers({ "Set-Cookie": refreshTokenCookie }),
        });

    } catch (error) {
        console.error("로그인 오류:", error);
        return new Response(JSON.stringify({ success: false, message: "서버 오류 발생" }), { status: 500 });
    }
};