import jwt from "jsonwebtoken";
import { User } from "$lib/entities/User";
import { config } from "$lib/config";




const ACCESS_TOKEN_SECRET = config.JWT_SECRET
const REFRESH_TOKEN_SECRET = config.JWT_REFRESH;
const IS_LOCAL = config.LOCAL_DB; // 개발 환경 여부

export function createTokens(user: User) {
    const accessToken = jwt.sign({ userId: user.id, username: user.username }, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId: user.id, username: user.username }, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    // Refresh Token을 httpOnly 쿠키로 설정
    const refreshTokenCookie = `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; ${IS_LOCAL ? "SameSite=None" : "Secure; SameSite=Strict"}`;

    return {
        accessToken,
        refreshTokenCookie, // 쿠키를 반환하도록 수정
    };
}
