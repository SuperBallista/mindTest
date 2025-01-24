import type { RequestHandler } from '@sveltejs/kit';
import { User } from '$lib/entities/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '$lib/ormconfig';
import { config } from "$lib/config";


export const POST: RequestHandler = async ({ request }) => {
    try {
        const { token, newPassword } = await request.json();

        if (!token || !newPassword) {
            return new Response(JSON.stringify({ success: false, message: "잘못된 요청입니다." }), { status: 400 });
        }

        // ✅ 비밀번호 형식 검사 (8자 이상, 영문+숫자 포함)
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return new Response(JSON.stringify({ success: false, message: "비밀번호는 8자 이상이며 영문과 숫자를 포함해야 합니다." }), { status: 400 });
        }

        // ✅ 토큰 검증
        let email: string;
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET) as { email: string };
            email = decoded.email;
        } catch (error) {
            return new Response(JSON.stringify({ success: false, message: "토큰이 유효하지 않거나 만료되었습니다." }), { status: 401 });
        }

        // ✅ 사용자 조회
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOneBy({ email });

        if (!user) {
            return new Response(JSON.stringify({ success: false, message: "존재하지 않는 사용자입니다." }), { status: 404 });
        }

        // ✅ 비밀번호 해싱 및 저장
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        user.password = hashedPassword;
        await userRepository.save(user);

        return new Response(JSON.stringify({ success: true, message: "비밀번호가 성공적으로 변경되었습니다." }), { status: 200 });

    } catch (error) {
        console.error("비밀번호 변경 오류:", error);
        return new Response(JSON.stringify({ success: false, message: "서버 오류가 발생했습니다." }), { status: 500 });
    }
};
