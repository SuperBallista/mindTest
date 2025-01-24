import { error } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { Post } from '$lib/entities/Post';
import { config } from "$lib/config";
import { User } from '$lib/entities/User.js';


export async function load({ params }) {
    // ✅ DB가 초기화되지 않았으면 초기화
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const postRepository = AppDataSource.getRepository(Post);
    const userRepository = AppDataSource.getRepository(User);
    const postId = params.id;

    // ✅ 테스트 데이터 가져오기
    const post = await postRepository.findOne({
        where: { id: postId },
        relations: ["user"] // ✅ user 관계를 자동으로 로드
    });

    if (!post) {
        throw error(404, 'post not found');
    }

    let writterData = null; // ✅ 기본값을 `null`로 명확하게 설정

    console.log("post.user:", post.user);
    console.log("post.user.id:", post.user?.id);

    if (post.user && post.user.id) {
        writterData = await userRepository.findOne({ where: { id: post.user.id } });
    }

    console.log("writterData 결과:", writterData); // ✅ 디버깅용 로그 추가

    return {
        writerName: writterData?.username || null,
        id: post.id,
        content: post.content,
        title: post.title,
        image: post.image,
        description: post.description,
        viewCount: post.views,
        likeCount: post.likes,
        dislikeCount: post.dislikes,
    };
}
