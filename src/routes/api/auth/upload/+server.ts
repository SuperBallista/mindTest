import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { Post } from '$lib/entities/Post';
import { Result } from '$lib/entities/Result';
import { TempUpload } from '$lib/entities/TempUpload';
import { User } from '$lib/entities/User';
import { v4 as uuid } from 'uuid';
import type { TestData, Result as TestResult } from '$lib/types';
export const POST: RequestHandler = async ({ request, locals }) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
        // ✅ 1. 클라이언트에서 받은 데이터 가져오기
        const requestData: TestData = await request.json();
        const { category, title, description, image, results, resultType, questions } = requestData;

        // ✅ 2. 새로운 게시글인지 수정인지 판별
        const isEdit = Boolean(requestData.id);
        const postId = (requestData.id && requestData.id !== "") ? requestData.id : uuid();
        requestData.id = postId;


        const postRepository = queryRunner.manager.getRepository(Post);
        const resultRepository = queryRunner.manager.getRepository(Result);
        const tempUploadRepository = queryRunner.manager.getRepository(TempUpload);
        const userRepository = queryRunner.manager.getRepository(User);

        // ✅ 3. 사용자 조회 (FK 관계 반영)
        const user = await userRepository.findOneBy({ id: locals.user.id });
        if (!user) {
            throw new Error("❌ 유효하지 않은 사용자입니다.");
        }

        // ✅ 4. 기존 게시글 조회 (수정 시 필요)
        let existingPost: Post | null = null;
        if (isEdit) {
            existingPost = await postRepository.findOneBy({ id: postId });
            if (!existingPost) {
                throw new Error(`❌ 게시글을 찾을 수 없음 (postId: ${postId})`);
            }
        }

        // ✅ 5. 기존 결과 UUID 매핑
        const existingResults = isEdit
            ? await resultRepository.find({ where: { post: { id: postId } } })
            : [];

        const resultMap = new Map<string, string>();
        existingResults.forEach((r) => {
            if (r.id) resultMap.set(r.id, r.id);
        });

        // ✅ 6. 결과 UUID를 미리 생성하고 저장
        results.forEach(result => {
            if (!result.resultDBId) {
                result.resultDBId = uuid(); // ✅ 새 UUID 생성 (새로운 결과)
            }
        });

        // ✅ 7. 선택지 내부 resultDBId를 미리 매핑
        questions.forEach(question => {
            question.choices.forEach(choice => {
                if (choice.resultId !== null && typeof choice.resultId === "number") {
                    const targetResult = results[choice.resultId];
                    if (!targetResult || !targetResult.resultDBId) {
                        throw new Error(`❌ 선택지가 참조하는 결과 ID가 존재하지 않음 (resultId: ${choice.resultId})`);
                    }
                    choice.resultDBId = targetResult.resultDBId;
                }
            });
        });


        // ✅ 8. 게시글 저장 (수정이면 업데이트)
        const newPost = postRepository.create({
            id: postId,
            user,
            category,
            title,
            description,
            image,
            content: requestData,
            created_at: isEdit ? existingPost!.created_at : new Date(),
            updated_at: new Date(),
        });

        const savedPost = await queryRunner.manager.save(newPost);

        // ✅ 9. 결과 저장 (추가 / 수정 / 삭제 감지)
        for (const result of results) {
            if (!result.resultDBId) {
                throw new Error(`❌ 저장 중 결과 ID가 없음: ${JSON.stringify(result)}`);
            }

            const existingResult = await resultRepository.findOneBy({ id: result.resultDBId });

            if (existingResult) {
                // ✅ 기존 결과 수정
                existingResult.title = result.title;
                existingResult.description = result.description;
                existingResult.image = result.image;
                existingResult.type = resultType;


            // 결과 업로드 이미지 정리

            if (existingResult.image) {
                await tempUploadRepository
                    .createQueryBuilder()
                    .delete()
                    .where("file_path = :image", { image: existingResult.image })
                    .execute();
            }
    


                await queryRunner.manager.save(existingResult);
            } else {
                // ✅ 새로운 결과 추가 (미리 생성된 UUID 사용)
                const newResult = resultRepository.create({
                    id: result.resultDBId,
                    post: savedPost,
                    description: result.description,
                    image: result.image,
                    type: resultType,
                    title: result.title,
                });

            // 결과 업로드 이미지 정리

            if (newResult.image) {
                await tempUploadRepository
                    .createQueryBuilder()
                    .delete()
                    .where("file_path = :image", { image: newResult.image })
                    .execute();
            }
    
                await queryRunner.manager.save(newResult);

            }

        }

        // ✅ 10. 임시 업로드된 이미지 정리
        if (image) {
            await tempUploadRepository
                .createQueryBuilder()
                .delete()
                .where("file_path = :image", { image })
                .execute();
        }



        

        await queryRunner.commitTransaction();
        return json({ success: true, message: '게시글이 성공적으로 저장되었습니다.', postId });

    } catch (error) {
        console.error("❌ 게시글 저장 중 오류 발생:", error);
        await queryRunner.rollbackTransaction();
        return json({ error: error || '서버 오류 발생' }, { status: 500 });
    } finally {
        await queryRunner.release();
    }
};
