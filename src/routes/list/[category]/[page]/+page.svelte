<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import { invalidateAll, goto } from "$app/navigation";
    import { browser } from "$app/environment"; // ✅ 브라우저 환경 확인

    // ✅ 데이터 타입 정의
    interface Post {
        id: string;
        title: string;
        description: string;
        image: string;
        viewCount: number;
        likeCount: number;
        dislikeCount: number;
    }

    interface DataType {
        category: string;
        list: Post[];
        currentPage: number;
        totalPages: number;
    }

    export let data: DataType;

    const { category, list, currentPage, totalPages } = data;

    // ✅ 페이지 이동 함수 (클라이언트 사이드 전환 + 데이터 강제 갱신)
    async function navigateTo(url: string) {
        if (!browser) return; // ✅ 서버에서 실행 방지

        if (window.location.pathname !== url) {
            console.log("✅ 페이지 이동:", url);
            await goto(url);
            await invalidateAll(); // ✅ 모든 데이터 강제 갱신
            location.reload(); // ✅ 강제 새로고침
        } else {
            console.log("⚠️ 현재 페이지와 동일하여 이동 안 함:", url);
        }
    }
</script>

<section class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold text-center mb-8">{category} 테스트</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each list as test}
            <Card {test} /> <!-- ✅ Card 컴포넌트에 정확한 데이터 전달 -->
        {/each}
    </div>

    <!-- 페이지네이션 UI -->
    <div class="flex justify-center mt-8 space-x-4">
        <!-- 이전 페이지 버튼 (첫 페이지일 경우 비활성화) -->
        <button 
            class="px-4 py-2 bg-gray-300 text-gray-600 rounded"
            on:click={() => navigateTo(`/list/${category}/${currentPage - 1}`)}
            disabled={currentPage <= 1}
        >
            이전
        </button>

        <span class="px-4 py-2 bg-white border rounded">페이지 {currentPage} / {totalPages}</span>

        <!-- 다음 페이지 버튼 (마지막 페이지일 경우 비활성화) -->
        <button 
            class="px-4 py-2 bg-gray-300 text-gray-600 rounded"
            on:click={() => navigateTo(`/list/${category}/${currentPage + 1}`)}
            disabled={currentPage >= totalPages}
        >
            다음
        </button>
    </div>
</section>
