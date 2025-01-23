import { AppDataSource } from '$lib/ormconfig';
import { Post } from '$lib/entities/Post';

export async function load({ }) {
    // ✅ DB가 초기화되지 않았으면 초기화
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const postRepository = AppDataSource.getRepository(Post);

    try {
        // ✅ 조회수 + 추천수 - 비추천수를 기준으로 정렬하여 상위 30개 가져오기
        const postlist = await postRepository
            .createQueryBuilder("post")
            .orderBy("(post.views + post.likes - post.dislikes)", "DESC") // ✅ 정렬 기준 적용
            .limit(30) // ✅ 상위 30개만 가져오기
            .getMany();

        console.log("조회된 데이터:", postlist); // 🛠 로그 추가

        return { 
            list: postlist.map(post => ({
                id: post.id,
                title: post.title,
                description: post.description,
                image: post.image,
                viewCount: post.views,
                likeCount: post.likes,
                dislikeCount: post.dislikes,            
            }))
        };
    } catch (error) {
        console.error("데이터 조회 오류:", error);
        return { list: [] }; // 에러 발생 시 빈 배열 반환
    }
}
