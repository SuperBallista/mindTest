import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'SAjkldlqw3ia35490450s'; // ✅ 환경 변수 사용
const JWT_REFRESH = process.env.JWT_REFRESH || '2350sdfuiofsjklo2wisdl';

export function verifyToken(token: string): Promise<{ id: string; username: string }> {
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


export async function verifyRefreshToken(token: string): Promise<string> {
    try {
        // ✅ 1. 리프레시 토큰 검증
        const decoded = jwt.verify(token, JWT_REFRESH) as { id: string };

        // ✅ 2. 데이터베이스에서 사용자 조회
        const userDB = AppDataSource.getRepository(User);
        const user = await userDB.findOne({ where: { id: decoded.id } });

        // ✅ 3. 사용자 존재 확인
        if (!user) {
            throw new Error("User not found");
        }

        // ✅ 4. 새로운 액세스 토큰 발급
        return jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '3d' } // ✅ 액세스 토큰 만료 시간 1시간
        );



    } catch (error) {
        console.error("Refresh token verification failed:", error);
        return "none"; // ✅ 검증 실패 시 "none" 반환
    }
}