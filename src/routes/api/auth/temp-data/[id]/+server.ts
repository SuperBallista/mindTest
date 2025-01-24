import { json } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { TempPost } from '$lib/entities/TempPost.js';


const tempPostRepository = AppDataSource.getRepository(TempPost);

/**
 * ✅ DELETE 요청: 특정 ID의 임시 데이터 삭제
 */
export async function DELETE({ params }) {
    try {
        const id = params.id; // ✅ 동적 경로에서 ID 가져오기


        const result = await tempPostRepository.delete(id);
        if (result.affected === 0) {
            console.warn(`⚠️ 삭제 실패: ID=${id} 데이터 없음`);
            return json({ error: '삭제할 데이터를 찾을 수 없습니다.' }, { status: 404 });
        }

        return json({ success: true, message: '데이터 삭제 완료' });

    } catch (error) {
        console.error('❌ 데이터 삭제 중 오류:', error);
        return json({ error: '서버 오류 발생' }, { status: 500 });
    }
}



/**
 * ✅ GET 요청: 특정 ID의 임시 데이터 불러오기
 */
export async function GET({ params }) {
    try {
        const id = params.id; // ✅ URL 경로에서 ID 가져오기


        const tempPost = await tempPostRepository.findOne({
            where: { id: id },
        });

        if (!tempPost) {
            console.warn(`⚠️ 데이터 없음: ID=${id}`);
            return json({ error: '해당 ID의 데이터를 찾을 수 없습니다.' }, { status: 404 });
        }

        return json({
            id: tempPost.id,
            title: tempPost.title,
            jsonData: tempPost.content,
        }, { status: 200 });

    } catch (error) {
        console.error("❌ 데이터 조회 중 오류:", error);
        return json({ error: '서버 오류 발생' }, { status: 500 });
    }
}
