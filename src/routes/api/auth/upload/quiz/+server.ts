import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';
import { Quiz } from '$lib/entities/Quiz';
import { Not } from 'typeorm';
import { TempUpload } from '$lib/entities/TempUpload';
import bcrypt from 'bcryptjs';


export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
 
        const userRepository = AppDataSource.getRepository(User);
        const quizRepository = AppDataSource.getRepository(Quiz);
        const tempImageRepository = AppDataSource.getRepository(TempUpload);

        const userId = locals.user.id;
        const requestData = await request.json();
        const { title, secure, content, image, password, limit, url, id } = requestData;

        // ✅ `content`를 JSON으로 변환
        let data: { questions?: { 이미지?: string; 선택지?: { 선택지?: string; 이미지?: string }[] }[] } = {};
        try {
            data = JSON.parse(content);
        } catch (err) {
            return json({ error: '잘못된 JSON 데이터입니다.' }, { status: 400 });
        }

        // URL 중복 검사
        const isUrlUsing = await quizRepository.count({
            where: {
                url: url,
                id: Not(id)
            }
        });

        if (isUrlUsing > 0) {
            return json({ error: '이미 사용 중인 URL입니다' }, { status: 409 });
        }

        // 유저 정보 확인
        const user = await userRepository.findOne({ where: { id: userId } });
        if (!user) {
            return json({ error: '유저 정보가 없습니다' }, { status: 401 });
        }

        let quizData: Quiz;
        if (typeof id === 'number') {
            quizData = (await quizRepository.findOne({ where: { id } })) ?? new Quiz();
        } else {
            quizData = new Quiz();
        }

        if (!quizData) {
            return json({ error: '코드 에러입니다' }, { status: 500 });
        }

        let hashedPassword = undefined
        if (secure==="password")
        {
            hashedPassword =  await bcrypt.hash(password, 12);
        }


        // NULL 방지 및 기본값 적용
        quizData.title = title ?? '';
        quizData.content = content ?? '';
        quizData.image = image ?? null;
        quizData.url = url ?? '';
        quizData.limit = limit ?? null;
        quizData.secure = secure ?? 'public';
        quizData.password = hashedPassword || undefined ;
        quizData.user = user;

        // ✅ `questions` 배열에서 이미지 추출 (안전한 데이터 접근)
        const imageArray = (data.questions ?? []).flatMap((q) => 
            [q.이미지, ...(q.선택지?.map(choice => choice.이미지) ?? [])]
        );

        // ✅ `image` 추가 후 빈 값 제거
        if (image) {
            imageArray.push(image);
        }
        const filteredImageArray = imageArray.filter(img => img && img.trim() !== '');

        console.log("삭제할 이미지 목록:", filteredImageArray);

        // ✅ `tempImageRepository.delete()` 수정 (TypeORM의 `delete()`는 where 조건 필요)
        await Promise.all(
            filteredImageArray.map(async (imageUrl) => {
                await tempImageRepository.delete({ file_path: imageUrl });
            })
        );

        const savedData = await quizRepository.save(quizData);

        return json({ success: true, message: '게시글이 성공적으로 저장되었습니다.' });
    } catch (error) {
        console.error("서버 오류:", error);
        return json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
    }
};
