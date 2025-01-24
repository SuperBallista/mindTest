import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { AppDataSource } from "$lib/ormconfig";
import { User } from "$lib/entities/User";
import { createTokens } from "$lib/auth/jwt";
import { config } from "$lib/config";

const KAKAO_CLIENT_ID = config.KAKAO_CLIENT_ID!;
const KAKAO_REDIRECT_URI = config.KAKAO_REDIRECT_URI!;

export const GET: RequestHandler = async ({ url }) => {
    const code = url.searchParams.get("code");

    if (!code) {
        throw redirect(302, "/login?error=no_code");
    }

    try {
        // ✅ 1. 카카오 토큰 요청
        const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: KAKAO_CLIENT_ID,
                redirect_uri: KAKAO_REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        }).then((res) => res.json());

        console.log("🔍 Kakao Token Response:", tokenResponse); // ✅ 응답 확인용 로그 추가

        if (!tokenResponse.access_token) {
            console.error("❌ Kakao OAuth 토큰 요청 실패:", tokenResponse);
            throw redirect(302, "/login?error=token_failed");
        }

        // ✅ 2. 카카오 사용자 정보 가져오기
        const userInfo = await fetch("https://kapi.kakao.com/v2/user/me", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((res) => res.json());

        if (!userInfo.id) {
            throw redirect(302, "/login?error=no_user");
        }

        const kakaoId = userInfo.id.toString();

        // ✅ 3. DB에서 Kakao ID로 사용자 조회
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        const userRepository = AppDataSource.getRepository(User);
        const existingUser = await userRepository.findOne({
            where: { kakaoId },
        });

        // ✅ 4. 사용자가 없으면 회원가입 페이지(`/register/kakao`)로 이동
        if (!existingUser) {
            throw redirect(302, `/register/kakao?kakaoId=${kakaoId}`);
        }


        const { accessToken, refreshTokenCookie } = createTokens(existingUser);

        return new Response(JSON.stringify({ success: true, message: "로그인 성공!", accessToken }), {
            status: 200,
            headers: new Headers({ "Set-Cookie": refreshTokenCookie }),
        });

    } catch (error) {
        console.error("로그인 오류:", error);
        return new Response(JSON.stringify({ success: false, message: "서버 오류 발생" }), { status: 500 });
    }
};