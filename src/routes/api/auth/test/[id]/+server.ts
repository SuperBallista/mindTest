import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { Post } from '$lib/entities/Post';
import { Result } from '$lib/entities/Result';
import { Comment } from '$lib/entities/Comment';
import { User } from '$lib/entities/User';


export const DELETE: RequestHandler = async ({ params, locals }) => {
    const postId = params.id;

    try {
        const userRepo = AppDataSource.getRepository(User);
        const postRepo = AppDataSource.getRepository(Post);
        const resultRepo = AppDataSource.getRepository(Result);
        const commentRepo = AppDataSource.getRepository(Comment);

        // ✅ 1. 게시글 찾기
        const post = await postRepo.findOne({ where: { id: postId },
            relations: ["user"] });

        if (!post) {
            return json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 });
        }


        // ✅ 2. 삭제 권한 확인 (작성자 또는 관리자만 삭제 가능)
        if (post.user.id !== locals.user.id) {
            return json({ error: '권한이 없습니다.' }, { status: 403 });
        }

        // ✅ 3. 게시글에 연결된 데이터 삭제 (FK 직접 관리)
        await commentRepo.delete({ post: { id: postId } }); // ✅ FK 객체를 ID 값으로 참조
        await resultRepo.delete({ post: { id: postId } }); // ✅ FK 객체를 ID 값으로 참조
        
        // ✅ 4. 게시글 삭제
        await postRepo.delete({ id: postId }); // ✅ FK 직접 삭제

        return json({ success: true, message: '게시글이 삭제되었습니다.' });

    } catch (error) {
        console.error('❌ 게시글 삭제 중 오류 발생:', error);
        return json({ error: '서버 오류 발생' }, { status: 500 });
    }
};
