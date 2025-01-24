import { AppDataSource } from '$lib/ormconfig';
import { TempUpload } from '$lib/entities/TempUpload';
import { v2 as cloudinary } from 'cloudinary';
import { config } from "$lib/config";

cloudinary.config({
    cloud_name: config.CLOUD_NAME,
    api_key: config.CLOUD_API_KEY,
    api_secret: config.CLOUD_API_SECRET
});

export async function deleteOldUnusedImages() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const tempImageRepo = AppDataSource.getRepository(TempUpload);

        // ✅ 1. 6시간 이상 지난 사용되지 않는 이미지 찾기
        const sixHoursAgo = new Date();
        sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);

        const oldUnusedImages = await tempImageRepo
            .createQueryBuilder("temp_uploads")
            .where("temp_uploads.temp_posts_id IS NULL")
            .andWhere("temp_uploads.created_at < :sixHoursAgo", { sixHoursAgo })
            .getMany();

        if (oldUnusedImages.length === 0) {
            console.log("✅ 6시간 이상 지난 사용되지 않는 이미지 없음.");
            return;
        }

        // ✅ 2. Cloudinary에서 이미지 삭제
        const publicIds = oldUnusedImages.map(img => {
            const parts = img.file_path.split('/');
            return parts[parts.length - 1].split('.')[0]; // Cloudinary public_id 추출
        });

        await cloudinary.api.delete_resources(publicIds, { resource_type: 'image' });

        // ✅ 3. DB에서 해당 이미지 데이터 삭제
        await tempImageRepo
            .createQueryBuilder()
            .delete()
            .from(TempUpload)
            .where("temp_posts_id IS NULL")
            .andWhere("created_at < :sixHoursAgo", { sixHoursAgo })
            .execute();

        console.log(`✅ ${oldUnusedImages.length}개의 6시간 이상 지난 이미지를 삭제했습니다.`);
    } catch (error) {
        console.error('❌ 사용되지 않는 이미지 삭제 중 오류 발생:', error);
    }
}
