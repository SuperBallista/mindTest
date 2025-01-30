import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { Quiz } from '$lib/entities/Quiz';

export const GET: RequestHandler = async ({ locals }) => {
    try {
        if (!locals.user) {
            return json({ success: false, error: '인증되지 않은 사용자입니다.' }, { status: 401 });
        }

        // ✅ DB 연결 확인
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const quizRepository = AppDataSource.getRepository(Quiz);

        // ✅ 현재 사용자가 작성한 게시글 목록 조회
        const posts = await quizRepository.find({
            where: { user: { id: locals.user.id } },
            order: { created_at: 'DESC' }, // 최신순 정렬
            take: 30 // ✅ 최신 게시글 30개만 가져오기
        });

        // ✅ 응답 데이터 변환
        const formattedPosts = posts.map(post => ({
            id: post.url,
            title: post.title,
            viewCount: post.views,
            likeCount: post.likes,
            dislikeCount: post.dislikes
        }));

        return json({ success: true, data: formattedPosts });
    } catch (error) {
        console.error("❌ 내 게시글 조회 오류:", error);
        return json({ success: false, error: '서버 오류 발생' }, { status: 500 });
    }
};
