import type { RequestHandler } from "@sveltejs/kit";
import { AppDataSource } from "$lib/ormconfig";
import { Quiz } from "$lib/entities/Quiz";
import bcrypt from 'bcrypt';
import { verifyToken } from "$lib/utils/auth";

export const POST: RequestHandler = async ({ request }) => {
    try {
        // 데이터베이스 초기화 (안 되어 있으면 실행)
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const quizRepository = AppDataSource.getRepository(Quiz);
        const { id, password, token } = await request.json();

        // 퀴즈 데이터 찾기
        const quizData = await quizRepository.findOne({ where: { id } });

        if (!quizData) {
            return new Response(JSON.stringify({ success: false, message: '해당 퀴즈가 없습니다.' }), {
                status: 404
            });
        }

        // 보안 설정에 따른 접근 제한 처리
        if (quizData.secure === "password") {
            const isMatch = await bcrypt.compare(password, String(quizData.password));
            if (!isMatch) {
                return new Response(JSON.stringify({ success: false, message: '암호가 틀렸습니다' }), {
                    status: 403
                });
            }
        }

        if (quizData.secure === "url") {
            const tokenCheck = await verifyToken(token as string);
            if (!tokenCheck) {
                return new Response(JSON.stringify({ success: false, message: 'URL이 잘못되었습니다' }), {
                    status: 403
                });
            }
        }

        // 정상적인 경우 퀴즈 데이터 반환

quizData.views = quizData.views + 1
await quizRepository.save(quizData)

        return new Response(
            JSON.stringify({
                success: true,
                quiz: quizData.content,
                timer: quizData.limit
            }),
            { status: 200 }
        );
    } catch (error) {
        console.error("서버 오류:", error);
        return new Response(JSON.stringify({ success: false, message: '서버 오류가 발생했습니다.' }), {
            status: 500
        });
    }
};
