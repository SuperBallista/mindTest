import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
    const testId = Number(params.id);
    const body = await request.json();

    if (isNaN(testId) || !body) {
        return json({ error: '잘못된 요청' }, { status: 400 });
    }

    let queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    try {
        await queryRunner.startTransaction("READ COMMITTED");

        // 트랜잭션 충돌 방지를 위한 데이터 잠금
        await queryRunner.manager.query('SET innodb_lock_wait_timeout = 5');
        const test = await queryRunner.manager.query(
            'SELECT * FROM tests WHERE id = ? FOR UPDATE',
            [testId]
        );

        if (!test.length) {
            throw new Error('테스트를 찾을 수 없습니다.');
        }

        // 인증된 사용자 여부 확인
        if (!locals.user) {
            throw new Error('인증되지 않은 사용자입니다.');
        }

        // 수정 권한 확인
        if (test[0].user_id !== locals.user.id && test[0].user_id !== 1) {
            throw new Error('권한이 없습니다.');
        }

        // 테스트 정보 업데이트
        await queryRunner.manager.query(
            `UPDATE tests SET category_id = ?, title = ?, description = ?, result_type = ?, image = ?, updated_at = NOW() WHERE id = ?`,
            [body.category, body.title, body.description, body.resultType, body.image, testId]
        );

        // 기존 결과 삭제
        await queryRunner.manager.query('DELETE FROM results WHERE test_id = ?', [testId]);
        await queryRunner.manager.query('DELETE FROM questions WHERE test_id = ?', [testId]);

        // 결과 및 점수 범위 삽입
        for (const resultData of body.results ?? []) {
            const insertedResult = await queryRunner.manager.query(
                `INSERT INTO results (test_id, title, description) VALUES (?, ?, ?) RETURNING id`,
                [testId, resultData.title, resultData.description]
            );
            const resultId = insertedResult[0].id;

            for (const rangeData of resultData.scoreRanges ?? []) {
                await queryRunner.manager.query(
                    `INSERT INTO score_ranges (result_id, min_score, max_score) VALUES (?, ?, ?)`,
                    [resultId, rangeData.minScore, rangeData.maxScore]
                );
            }
        }

        // 질문 및 선택지 삽입
        for (const questionData of body.questions ?? []) {
            const insertedQuestion = await queryRunner.manager.query(
                `INSERT INTO questions (test_id, text) VALUES (?, ?) RETURNING id`,
                [testId, questionData.text]
            );
            const questionId = insertedQuestion[0].id;

            for (const choiceData of questionData.choices ?? []) {
                await queryRunner.manager.query(
                    `INSERT INTO choices (question_id, text, is_correct) VALUES (?, ?, ?)`,
                    [questionId, choiceData.text, choiceData.isCorrect]
                );
            }
        }

        await queryRunner.commitTransaction();
    } catch (error) {
        if (queryRunner.isTransactionActive) {
            await queryRunner.rollbackTransaction();
        }
        console.error('❌ PUT 요청 실패:', error);
        return json({ error: error || '서버 오류 발생' }, { status: 500 });
    } finally {
        await queryRunner.release();
    }

    return json({ success: true, message: '테스트가 수정되었습니다.', testId });
};
