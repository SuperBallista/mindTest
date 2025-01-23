import { redirect } from "@sveltejs/kit";
import type { RequestHandler } from "@sveltejs/kit";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { AppDataSource } from "$lib/ormconfig";
import { User } from "$lib/entities/User";
import { createTokens } from "$lib/auth/jwt";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;

const secret = process.env.JWT_SECRET || '908aseiodfosaklsjdjasduldkjasdl%*^#%^&^&%@@SD';
const refreshSecret = process.env.JWT_REFRESH || '908aseiodfosasdasdasdaklsjdjl%*^#%IUDWAsHKJDkCX^&^&%@@SD';
const localServer = process.env.LOCAL_DB || false;

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
        console.error("Google 로그인 실패:", error);
        throw redirect(302, "/login?error=server_error");
    }
};
