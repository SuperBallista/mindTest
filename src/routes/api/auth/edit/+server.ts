import { Quiz } from '$lib/entities/Quiz.js';
import { AppDataSource } from '$lib/ormconfig.js';
import { json } from "@sveltejs/kit"; // ✅ JSON 응답을 위해 추가

export async function POST({ request, locals }) {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    try {
        const data = await request.json(); // ✅ data.url 구조 분해
        if (!data.url) {
            return json({ error: 'URL이 제공되지 않았습니다.' }, { status: 400 });
        }

        const quizRepository = AppDataSource.getRepository(Quiz);
        const quizData = await quizRepository.findOne({
            where: { url: data.url },
            relations: ["user"],
        });

        if (!quizData) {
            return json({ error: '해당 문제를 찾을 수 없습니다.' }, { status: 404 });
        }

        if (!quizData.user || quizData.user.id !== locals.user.id) {
            return json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        return json({ content: quizData.content }, { status: 200 }); // ✅ JSON 응답으로 변경
    } catch (error) {
        console.error("❌ 오류 발생:", error);
        return json({ error: error || "알 수 없는 오류가 발생했습니다." }, { status: 500 });
    }
}
