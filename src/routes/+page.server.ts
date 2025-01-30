import { Quiz } from '$lib/entities/Quiz.js';
import { AppDataSource } from '$lib/ormconfig';


export async function load({ }) {
    // ✅ DB가 초기화되지 않았으면 초기화
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    const quizRepository = AppDataSource.getRepository(Quiz);

    try {
        // ✅ 조회수 + 추천수 - 비추천수를 기준으로 정렬하여 상위 30개 가져오기
        const quizData = await quizRepository.find({where:{secure:"public"}})
        
        
        return { 
            list: quizData.map(post => ({
                title: post.title,
                image: post.image || "",
                url: post.url,
                likes: post.likes,
                views: post.views,
                dislikes: post.dislikes

            }))
        };
    } catch (error) {
        console.error("데이터 조회 오류:", error);
        return { list: [] }; // 에러 발생 시 빈 배열 반환
    }
}
