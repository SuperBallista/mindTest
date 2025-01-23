import { AppDataSource } from '$lib/ormconfig';
import { Post } from '$lib/entities/Post';

export async function load({ params }) {


    // ✅ DB가 초기화되지 않았으면 초기화
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    // ✅ 카테고리 값 검증
    const allowedCategories = ["연애", "성격", "기타"] as const;
    const categorylink = allowedCategories.includes(params.category as any) ? (params.category as "연애" | "성격" | "기타") : "기타";
    
    console.log("카테고리 값:", categorylink); // 🛠 로그 추가

    const postRepository = AppDataSource.getRepository(Post);

    // ✅ 포스트 데이터 가져오기
    try {
        const postlist = await postRepository.find({
            where: { category: categorylink }
        });

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
            })),
            category: params.category
        };
    } catch (error) {
        console.error("데이터 조회 오류:", error);
        return { list: [] }; // 에러 발생 시 빈 배열 반환
    }
}
