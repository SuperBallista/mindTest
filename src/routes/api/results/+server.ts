import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { Post } from '$lib/entities/Post';
import { Result } from '$lib/entities/Result';
import { TempUpload } from '$lib/entities/TempUpload';

export const POST: RequestHandler = async ({ request, locals }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction(); // 트랜잭션 시작

    try {
        // ✅ 클라이언트에서 받은 데이터 가져오기
        const requestData = await request.json();
        const { category, title, description, image, content, results } = requestData;

        const postRepository = queryRunner.manager.getRepository(Post);
        const resultRepository = queryRunner.manager.getRepository(Result);
        const tempUploadRepository = queryRunner.manager.getRepository(TempUpload);

        // ✅ 1. 게시글 저장
        const newPost = postRepository.create({
            user_id: locals.user.id,
            category,
            title,
            description,
            image,
            content,
            created_at: new Date(),
            updated_at: new Date(),
        });
        const savedPost = await queryRunner.manager.save(newPost); // 게시글 저장

        // ✅ 2. 결과 저장 (테스트 결과 저장)
        for (const result of results) {
            const newResult = resultRepository.create({
                post_id: savedPost.id,
                description: result.description,
                image: result.image,
            });

            await queryRunner.manager.save(newResult);
        }

        // ✅ 3. 임시 업로드된 이미지 정리
        if (image) {
            await tempUploadRepository.delete({ file_path: image });
        }

        await queryRunner.commitTransaction(); // 트랜잭션 커밋
        return json({ message: '게시글이 성공적으로 업로드되었습니다.', postId: savedPost.id });

    } catch (error) {
        console.error("❌ 게시글 업로드 중 오류 발생:", error);
        await queryRunner.rollbackTransaction(); // 트랜잭션 롤백
        return json({ error: '서버 오류 발생' }, { status: 500 });
    } finally {
        await queryRunner.release(); // 트랜잭션 종료
    }
};
