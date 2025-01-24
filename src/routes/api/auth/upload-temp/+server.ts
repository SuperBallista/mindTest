import { json } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { config } from "$lib/config";
import { AppDataSource } from '$lib/ormconfig';
import { TempUpload } from '$lib/entities/TempUpload';


// ✅ Cloudinary 설정
cloudinary.config({
    cloud_name: config.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

export async function POST({ request }) {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return json({ error: '파일이 없습니다' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // ✅ Cloudinary 업로드 함수
        const uploadToCloudinary = (): Promise<string> => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'ddangkong', resource_type: 'image' },
                    (error, result) => {  // ✅ async 제거
                        if (error || !result) {
                            reject(new Error('Cloudinary 업로드 실패'));
                        } else {
                            // ✅ DB 저장을 별도 함수로 처리
                            saveImageToDB(result.secure_url)
                                .then(() => resolve(result.secure_url))
                                .catch(() => reject(new Error('DB 저장 실패')));
                        }
                    }
                );
                Readable.from(buffer).pipe(uploadStream);
            });
        };

        // ✅ Cloudinary 업로드 실행 및 DB 저장
        const uploadedUrl = await uploadToCloudinary();

        return json({ url: uploadedUrl });

    } catch (error) {
        console.error('이미지 업로드 중 오류 발생:', error);
        return json({ error: '서버 오류' }, { status: 500 });
    }
}

// ✅ 별도의 DB 저장 함수
async function saveImageToDB(file_path: string) {
    try {
        const tempImageRepo = AppDataSource.getRepository(TempUpload);
        const newImage = tempImageRepo.create({ file_path, temp_posts_id:null});
        await tempImageRepo.save(newImage);
    } catch (dbError) {
        console.error('DB 저장 중 오류 발생:', dbError);
        throw new Error('DB 저장 실패');
    }
}
