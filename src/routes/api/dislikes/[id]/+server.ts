import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { Quiz } from '$lib/entities/Quiz';

/**
 * ✅ [POST] 비추천(👎) 증가 API
 */
export const POST: RequestHandler = async ({ params }) => {
    const postId = params.id;

    if (!postId) {
        return json({ success: false, error: 'postId가 제공되지 않았습니다.' }, { status: 400 });
    }

    try {
        const postRepository = AppDataSource.getRepository(Quiz);
        const post = await postRepository.findOneBy({ id: Number(postId) });

        if (!post) {
            return json({ success: false, error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }

        post.dislikes += 1; // 👎 비추천 수 증가
        await postRepository.save(post);

        return json({ success: true, dislikeCount: post.dislikes });
    } catch (error) {
        console.error("❌ 비추천 API 오류:", error);
        return json({ success: false, error: '서버 오류 발생' }, { status: 500 });
    }
};
