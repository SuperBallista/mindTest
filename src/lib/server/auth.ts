import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import type { RequestEvent } from '@sveltejs/kit';
import type { JwtPayload } from 'jsonwebtoken';

dotenv.config();

export async function verifyAuth(event: RequestEvent) {
    try {
        // ✅ `event.cookies.get()`로 httpOnly 쿠키 가져오기
        const token = event.cookies.get("refreshToken");
        console.log("🔹 Retrieved refreshToken:", token);

        if (!token) {
            console.error("❌ refreshToken이 존재하지 않습니다.");
            return null;
        }

        const JWT_REFRESH = process.env.JWT_REFRESH || "jwt_refresh";
        if (!JWT_REFRESH) {
            console.error("❌ JWT_REFRESH가 환경 변수에 설정되지 않았습니다.");
            return null;
        }

        try {
            const decoded = jwt.verify(token, JWT_REFRESH) as JwtPayload;
            console.log("✅ Decoded Token:", decoded);

            if (!decoded || typeof decoded !== 'object' || !decoded.id) {
                console.error("❌ JWT 토큰에 유효한 ID가 없습니다.");
                return null;
            }

            console.log("🔍 Searching for user with ID:", decoded.id);
            const userRepo = AppDataSource.getRepository(User);
            const user = await userRepo.findOne({ where: { id: decoded.id } });

            if (!user) {
                console.error(`❌ ID ${decoded.id}를 가진 사용자가 DB에 존재하지 않습니다.`);
                return null;
            }

            return user;
        } catch (error) {
            console.error("❌ JWT 검증 실패:", error);
            return null;
        }
    } catch (error) {
        console.error("❌ 인증 실패:", error);
        return null;
    }
}
