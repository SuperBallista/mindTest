import { deleteOldUnusedImages } from '$lib/utils/deleteUnusedImage';

// ✅ 1시간마다 실행 (3600000ms = 1시간)
export function startCleanupTask() {
    setInterval(async () => {
        console.log("🔄 6시간 지난 이미지 삭제 실행...");
        await deleteOldUnusedImages();
    }, 3600000); // 테스트할 때 10초마다 실행하려면 `10000`으로 변경
}
