import jwt from 'jsonwebtoken';
import {config} from '$lib/config'
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';
import type { JwtPayload } from 'jsonwebtoken';


const JWT_SECRET = config.JWT_SECRET; // ✅ 환경 변수 사용
const JWT_REFRESH = config.JWT_REFRESH;


export async function verifyToken(token: string): Promise<{ id: string; username: string }> {
    if (!JWT_SECRET) {
        throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
    }

    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(decoded as { id: string; username: string });
            }
        });
    });
}



export async function verifyRefreshToken(token: string): Promise<string | null> {
    try {
        if (!JWT_SECRET || !JWT_REFRESH) {
            throw new Error("JWT_SECRET 또는 JWT_REFRESH 환경 변수가 설정되지 않았습니다.");
        }

        const decoded = jwt.verify(token, JWT_REFRESH) as JwtPayload;

        if (!decoded || typeof decoded !== "object" || !decoded.id) {
            throw new Error("Invalid refresh token payload");
        }

        const userDB = AppDataSource.getRepository(User);
        const user = await userDB.findOne({ where: { id: decoded.id } });

        if (!user) {
            throw new Error("User not found");
        }

        return jwt.sign(
            { id: user.id, username: user.username, iat: Math.floor(Date.now() / 1000) },
            JWT_SECRET,
            { expiresIn: '3d' }
        );

    } catch (error) {
        console.error("❌ Refresh token verification failed:", error);
        return null; // ✅ 검증 실패 시 `null` 반환
    }
}
