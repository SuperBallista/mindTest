import { error } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { Result } from '$lib/entities/Result';
import { Post } from '$lib/entities/Post';

import { config } from "$lib/config";


/**
 * ✅ 결과 페이지 데이터 로드 함수
 * - 결과 정보를 DB에서 가져와서 반환
 * - 조회수 증가 로직 포함
 */
export async function load({ params }) {
    // ✅ DB 연결 확인
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const resultRepository = AppDataSource.getRepository(Result);
    const postRepository = AppDataSource.getRepository(Post);

    const resultId = params.id;

    // ✅ 결과 데이터 가져오기
    const result = await resultRepository.findOne({
        where: { id: resultId },
        relations: ['post'], // ✅ 'post'와 관계를 맺은 데이터를 함께 가져옴
    });

    if (!result) {
        throw error(404, 'Result not found');
    }

    // ✅ 테스트 ID 가져오기 (이전 페이지로 돌아갈 때 필요)
    const postId = result.post.id ?? null;

    // ✅ 조회수 증가
    if (result.post) {
        await postRepository.increment({ id: postId }, 'views', 1);
    }

    return {
        postId,
        id: result.id,
        title: result.title,
        description: result.description,
        image: result.image,
        viewCount: result.post?.views ?? 0,
        likeCount: result.post?.likes ?? 0,
        dislikeCount: result.post?.dislikes ?? 0,

    };
}
