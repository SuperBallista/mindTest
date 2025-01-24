import { AppDataSource } from "$lib/ormconfig";
import { Post } from "$lib/entities/Post";
import type { Load } from "@sveltejs/kit";

export const load: Load = async ({ params }) => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const allowedCategories = ["연애", "성격", "기타"] as const;
    const category = allowedCategories.includes(params.category as any)
        ? (params.category as "연애" | "성격" | "기타")
        : "기타";

    const page = params.page ? Number(params.page) : 1;
    const pageSize = 9;

    const postRepository = AppDataSource.getRepository(Post);

    try {
        const totalPosts = await postRepository.count({ where: { category } });

        const postlist = await postRepository.find({
            where: { category },
            order: { created_at: "DESC" },
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        console.log(`✅ 데이터 로드: ${category}, 페이지 ${page}`);

        return {
            category,
            list: postlist.map(post => ({
                id: post.id,
                title: post.title,
                description: post.description,
                image: post.image,
                viewCount: post.views,
                likeCount: post.likes,
                dislikeCount: post.dislikes,
            })),
            currentPage: page,
            totalPages: Math.ceil(totalPosts / pageSize),
        };
    } catch (error) {
        console.error("❌ 데이터 조회 오류:", error);
        return { category, list: [], currentPage: 1, totalPages: 1 };
    }
};
