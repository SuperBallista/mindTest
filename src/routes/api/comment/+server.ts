import { json } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { Comment } from '$lib/entities/Comment';
import type { RequestEvent } from '@sveltejs/kit';
import { User } from '$lib/entities/User';

export const POST = async (event: RequestEvent) => {
    try {
        let user = event.locals.user // ✅ 로그인 사용자 확인 (null 가능)

        const { testId, text } = await event.request.json();
        if (!testId || !text.trim()) {
            return json({ success: false, message: '잘못된 요청' }, { status: 400 });
        }

        const commentRepo = AppDataSource.getRepository(Comment);
        const newComment = commentRepo.create({
            post: testId,
            userId: user ? user.id : null, // ✅ 비로그인 사용자는 userId를 null로 저장
            content: text,
            created_at: new Date(),
        });

        await commentRepo.save(newComment);

        return json({ success: true, message: '댓글이 추가되었습니다.', data: newComment });
    } catch (error) {
        console.error('❌ 댓글 추가 오류:', error);
        return json({ success: false, message: '서버 오류' }, { status: 500 });
    }
};


export const GET = async (event: RequestEvent) => {
    try {
        const url = new URL(event.request.url);
        const testId = url.searchParams.get('testId');

        if (!testId) {
            return json({ success: false, message: '잘못된 요청' }, { status: 400 });
        }

        const commentRepo = AppDataSource.getRepository(Comment);

        // ✅ TypeORM QueryBuilder로 userId를 이용해 username을 가져오기
        const comments = await commentRepo.createQueryBuilder("comment")
            .leftJoinAndSelect(User, "user", "comment.userId = user.id") // ✅ userId를 user 테이블과 연결
            .where("comment.post = :testId", { testId })
            .orderBy("comment.created_at", "ASC")
            .select([
                "comment.id",
                "comment.userId",
                "user.username", // ✅ user 테이블에서 username 가져오기
                "comment.content",
                "comment.created_at"
            ])
            .getRawMany();

        // ✅ 프론트엔드로 데이터 변환 후 반환
        const responseData = comments.map(comment => ({
            id: comment.comment_id,
            userId: comment.comment_userId,
            username: comment.user_username || "익명", // ✅ 비로그인 사용자는 "익명" 처리
            text: comment.comment_content,
            createdAt: comment.comment_created_at
        }));

        return json(responseData);
    } catch (error) {
        console.error('❌ 댓글 불러오기 오류:', error);
        return json({ success: false, message: '서버 오류' }, { status: 500 });
    }
};
