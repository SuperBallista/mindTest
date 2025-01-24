import { json } from "@sveltejs/kit";
import { AppDataSource } from "$lib/ormconfig";
import { Post } from "$lib/entities/Post";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ url }) => {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const allowedCategories = ["연애", "성격", "기타"] as const; // ✅ 리터럴 타입으로 지정
    const categoryParam = url.searchParams.get("category") || "기타";

    // ✅ 올바른 카테고리인지 검사 후, 리터럴 타입으로 변환
    const category: "연애" | "성격" | "기타" =
        allowedCategories.includes(categoryParam as any) ? (categoryParam as "연애" | "성격" | "기타") : "기타";

    const page = Number(url.searchParams.get("page") || 1);
    const pageSize = 9;

    const postRepository = AppDataSource.getRepository(Post);

    try {
        const totalPosts = await postRepository.count({
            where: { category }, // ✅ 타입이 호환되도록 수정
        });

        const postlist = await postRepository.find({
            where: { category }, // ✅ category 타입 호환
            order: { created_at: "DESC" },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return json({
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
        });
    } catch (error) {
        console.error("❌ 데이터 조회 오류:", error);
        return json({ error: "서버 오류 발생" }, { status: 500 });
    }
};
