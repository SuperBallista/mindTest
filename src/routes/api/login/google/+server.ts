import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import { AppDataSource } from "$lib/ormconfig";
import { User } from "$lib/entities/User";
import { createTokens } from "$lib/auth/jwt";
import { config } from "$lib/config";

const GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = config.GOOGLE_REDIRECT_URI!;

const secret = config.JWT_SECRET || '908aseiodfosaklsjdjasduldkjasdl%*^#%^&^&%@@SD';
const refreshSecret = config.JWT_REFRESH || '908aseiodfosasdasdasdaklsjdjl%*^#%IUDWAsHKJDkCX^&^&%@@SD';
const localServer = config.LOCAL_DB || false;

export const GET: RequestHandler = async ({ url }) => {
    const code = url.searchParams.get("code");

    if (!code) {
        throw redirect(302, "/login?error=no_code");
    }

    try {
        // ✅ 1. Google 토큰 요청
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        }).then((res) => res.json());

        console.log("🔍 Google Token Response:", tokenResponse); // ✅ 응답 확인용 로그 추가

        if (!tokenResponse.access_token) {
            console.error("❌ Google OAuth 토큰 요청 실패:", tokenResponse);
            throw redirect(302, "/login?error=token_failed");
        }

        // ✅ 2. Google 사용자 정보 가져오기
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((res) => res.json());

        if (!userInfo.id || !userInfo.email) {
            throw redirect(302, "/login?error=no_user");
        }

        // ✅ 3. DB에서 Google ID로 사용자 조회
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        const userRepository = AppDataSource.getRepository(User);
        const existingUser = await userRepository.findOne({
            where: { googleId: userInfo.id },
        });

        // ✅ 4. 사용자가 없으면 회원가입 페이지(`/register/google`)로 이동
        if (!existingUser) {
            throw redirect(302, `/register/google?email=${encodeURIComponent(userInfo.email)}&googleId=${userInfo.id}`);
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