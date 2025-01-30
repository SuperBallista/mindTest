import { error } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';
import { Quiz } from '$lib/entities/Quiz';
import jwt from 'jsonwebtoken';
import { config } from '$lib/config.js';
import type { PageServerLoad } from './$types';
import { image } from '$lib/stores/QuestionStore';
import { Like } from 'typeorm';

export const load: PageServerLoad = async ({ params }) => {
    try {
        // ✅ DB가 초기화되지 않았으면 초기화
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const quizRepository = AppDataSource.getRepository(Quiz);
        const userRepository = AppDataSource.getRepository(User);
        const quizSrc = params.src;

        // ✅ 퀴즈 데이터 가져오기
        const quiz = await quizRepository.findOne({
            where: { url: quizSrc },
            relations: ['user'], // ✅ `user` 관계 로드
        });

        if (!quiz) {
            throw error(404, '해당 퀴즈를 찾을 수 없습니다.');
        }

        // ✅ 작성자 데이터 가져오기 (옵셔널)
        const writerData = quiz.user?.id
            ? await userRepository.findOne({ where: { id: quiz.user.id } })
            : null;

        // ✅ JWT 토큰 생성 (만료 시간 추가)
        const token = jwt.sign({ url: quiz.url }, config.JWT_SECRET, { expiresIn: '10d' });

        return {
            writerName: writerData?.username || '익명',
            writerId: writerData?.id || null,
            id: quiz.id,
            title: quiz.title,
            image: quiz.image,
            secure: quiz.secure,
            url: quiz.url,
            token: token,
            views: quiz.views,
            likes: quiz.likes,
            dislikes: quiz.dislikes,
            timer: quiz.limit
        };
    } catch (err) {
        console.error('❌ 서버 오류:', err);
        throw error(500, '서버 오류가 발생했습니다.');
    }
};
