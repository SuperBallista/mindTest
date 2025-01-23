import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { TempPost } from '$lib/entities/TempPost';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        // ✅ 1. 클라이언트에서 데이터 가져오기
        const { userId, title, content } = await request.json();

        if (!title || !content) {
            return json({ success: false, message: '제목과 내용을 입력하세요.' }, { status: 400 });
        }

        const tempPostRepo = AppDataSource.getRepository(TempPost);

        // ✅ 2. 임시 데이터 저장
        const newTempPost = tempPostRepo.create({
            user_id: userId , 
            title,
            content: JSON.stringify(content), // ✅ JSON 데이터 변환
            created_at: new Date(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // ✅ 24시간 후 자동 만료
        });

        await tempPostRepo.save(newTempPost);

        return json({ success: true, message: '임시 저장 완료!', id: newTempPost.id }, { status: 201 });

    } catch (error) {
        console.error('❌ 임시 데이터 저장 중 오류 발생:', error);
        return json({ success: false, message: '서버 오류 발생' }, { status: 500 });
    }
};


export const GET: RequestHandler = async ({ url }) => {
    try {
        const userId = url.searchParams.get('userId'); // ✅ URL에서 userId 가져오기

        if (!userId) {
            return json({ success: false, message: 'userId가 필요합니다.' }, { status: 400 });
        }

        const tempPostRepo = AppDataSource.getRepository(TempPost);

        // ✅ 해당 사용자의 임시 저장 데이터 가져오기
        const tempPosts = await tempPostRepo.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' } // ✅ 최신순 정렬
        });

        if (!tempPosts.length) {
            return json({ success: false, message: '저장된 데이터가 없습니다.' }, { status: 404 });
        }

        return json({ success: true, data: tempPosts }, { status: 200 });

    } catch (error) {
        console.error('❌ 임시 데이터 조회 중 오류 발생:', error);
        return json({ success: false, message: '서버 오류 발생' }, { status: 500 });
    }
};
