import type { RequestHandler } from "@sveltejs/kit";
import jwt from "jsonwebtoken";
import { AppDataSource } from "$lib/ormconfig";
import { User } from "$lib/entities/User";
import { config } from "$lib/config";

const KAKAO_CLIENT_ID = config.KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = config.KAKAO_REDIRECT_URI;
const JWT_SECRET = config.JWT_SECRET
const JWT_REFRESH_SECRET = config.JWT_REFRESH;
const LOCAL_SERVER = config.LOCAL_DB;

export const GET: RequestHandler = async ({ url }) => {
    const code = url.searchParams.get("code");

    if (!code) {
        return new Response(null, { status: 302, headers: { Location: "/login?error=missing_code" } });
    }

    try {
        // ✅ 1. 카카오 토큰 요청
        const tokenResponse = await fetch("https://kauth.kakao.com/oauth/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                client_id: KAKAO_CLIENT_ID,
                redirect_uri: KAKAO_REDIRECT_URI,
                code,
            }),
        }).then((res) => res.json());

        if (!tokenResponse.access_token) {
            return new Response(null, { status: 302, headers: { Location: "/login?error=token_failed" } });
        }

        // ✅ 2. 카카오 사용자 정보 요청
        const userInfo = await fetch("https://kapi.kakao.com/v2/user/me", {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        }).then((res) => res.json());

        if (!userInfo.id) {
            return new Response(null, { status: 302, headers: { Location: "/login?error=userinfo_failed" } });
        }

        const kakaoId = userInfo.id.toString();
        const nickname = userInfo.kakao_account?.profile?.nickname || "카카오사용자";

        // ✅ 3. DB에서 카카오 ID로 사용자 조회
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        const userRepository = AppDataSource.getRepository(User);
        let user = await userRepository.findOne({ where: { kakaoId } });

        // ✅ 4. 사용자가 없으면 회원가입 정보와 함께 `/login`으로 리다이렉트
        if (!user) {
            return new Response(null, {
                status: 302,
                headers: {
                    Location: `/login?status=register_needed&kakaoId=${kakaoId}`,
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
        console.error("카카오 로그인 실패:", error);
        return new Response(null, { status: 302, headers: { Location: "/login?status=error&error=server_error" } });
    }
};
