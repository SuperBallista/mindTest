import type { RequestHandler } from "@sveltejs/kit";
import { User } from "$lib/entities/User";
import { json } from "@sveltejs/kit";
import { AppDataSource } from "$lib/ormconfig";
import { createTokens } from "$lib/auth/jwt";

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { kakaoId, username } = await request.json();

        if (!kakaoId || !username) {
            return json({ success: false, message: "잘못된 요청입니다." }, { status: 400 });
        }

        const userRepository = AppDataSource.getRepository(User);

        // 중복 닉네임 검사
        const existingUser = await userRepository.findOne({ where: { username } });
        if (existingUser) {
            return json({ success: false, message: "이미 사용 중인 닉네임입니다." }, { status: 400 });
        }

        // 새로운 사용자 생성
        const newUser = userRepository.create({ kakaoId, username });
        await userRepository.save(newUser);



                // ✅ 5. 사용자가 있으면 JWT 생성 후 쿠키 저장
                       const {accessToken, refreshToken, localServer} = createTokens(new User)
                
                
                // ✅ Refresh Token을 httpOnly 쿠키에 저장
                const headers = new Headers();
                headers.append('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; ${ localServer ? "" : "Secure" }; SameSite=Strict`);
        
                return new Response(JSON.stringify({
                    success: true,
                    message: '로그인 성공!',
                    accessToken
                }), { status: 200, headers });
    

    } catch (error) {
        console.error("❌ 회원가입 오류:", error);
        return json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 });
    }
};
