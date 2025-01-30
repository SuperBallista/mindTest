import { json } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';
import { Quiz } from '$lib/entities/Quiz.js';

export async function GET({ locals }) {
    if (!locals.user || !locals.user.id) {
        return json({ success: false, error: "인증이 필요합니다." }, { status: 401 });
    }

    try {
        const userRepository = AppDataSource.getRepository(User);
        const postRepository = AppDataSource.getRepository(Quiz);

        // ✅ 사용자 정보 조회
        const user = await userRepository.findOne({
            where: { id: locals.user.id },
            select: ['id', 'username', 'created_at', 'googleId', 'kakaoId'], // 필요한 정보만 선택
        });

        if (!user) {
            return json({ success: false, error: "사용자를 찾을 수 없습니다." }, { status: 404 });
        }

        let origin = "db"

        if (user.googleId)
        {origin = "Google"}
        else if (user.kakaoId)
        {origin = "Kakao"}


        // ✅ 게시물 수 조회
        const postCount = await postRepository.count({
            where: { user: { id: locals.user.id } }
        });

        // ✅ 받은 좋아요 수 조회
        const totalLikes = await postRepository
            .createQueryBuilder("post")
            .where("post.user_id = :userId", { userId: locals.user.id })
            .select("SUM(post.likes)", "totalLikes")
            .getRawOne();

            function formatDate(date:Date):string{
                let year = date.getFullYear();
                let month = date.getMonth()+1;
                let day = date.getDate();
                return year + "." + month + "." + day + "."
            }
        

        return json({
            success: true,
            data: {
                id: user.id,
                nickname: user.username,
                createdAt: formatDate(user.created_at),
                postCount,
                totalLikes: totalLikes?.totalLikes || 0,
                origin: origin,
            }
        });

    } catch (error) {
        console.error("❌ 내 정보 조회 오류:", error);
        return json({ success: false, error: "서버 오류 발생" }, { status: 500 });
    }
}
