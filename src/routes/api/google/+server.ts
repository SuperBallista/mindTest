import type { RequestHandler } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { AppDataSource } from "$lib/ormconfig";
import { User } from "$lib/entities/User";
import { config } from "$lib/config";

const GOOGLE_CLIENT_ID = config.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = config.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = config.GOOGLE_REDIRECT_URI!;
const JWT_SECRET = config.JWT_SECRET;
const JWT_REFRESH_SECRET = config.JWT_REFRESH;
const LOCAL_SERVER = config.LOCAL_DB;

export const GET: RequestHandler = async ({ url }) => {
    const code = url.searchParams.get("code");

    if (!code) {
        return new Response(null, { status: 302, headers: { Location: "/login?error=missing_code" } });
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

        if (!tokenResponse.access_token) {
            return new Response(null, { status: 302, headers: { Location: "/login?error=token_failed" } });
        }

        // ✅ 2. Google 사용자 정보 가져오기
        const userInfo = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((res) => res.json());

        if (!userInfo.id || !userInfo.email) {
            return new Response(null, { status: 302, headers: { Location: "/login?error=userinfo_failed" } });
        }

        // ✅ 3. DB에서 Google ID로 사용자 조회
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        const userRepository = AppDataSource.getRepository(User);
        let user = await userRepository.findOne({ where: { googleId: userInfo.id } });

        // ✅ 4. 사용자가 없으면 회원가입 정보와 함께 `/login`으로 리다이렉트
        if (!user) {
            return new Response(null, {
                status: 302,
                headers: {
                    Location: `/login?status=register_needed&email=${encodeURIComponent(userInfo.email)}&googleId=${userInfo.id}`,
                },
            });
        }

        // ✅ 5. JWT 토큰 생성 (AccessToken + RefreshToken)
        const accessToken = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: "3h" }
        );

        const refreshToken = jwt.sign(
            { id: user.id },
            JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // ✅ Refresh Token을 httpOnly 쿠키에 저장
        const headers = new Headers();
        headers.append(
            "Set-Cookie",
            `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; ${LOCAL_SERVER ? "" : "Secure"}; SameSite=Strict`
        );
        headers.append("Location", `/login?status=success&token=${accessToken}`);

        // ✅ 로그인 성공 후 `/login`으로 리디렉트 (토큰 포함)
        return new Response(null, { status: 302, headers });

    } catch (error) {
        console.error("Google 로그인 실패:", error);
        return new Response(null, { status: 302, headers: { Location: "/login?status=error&error=server_error" } });
    }
};
