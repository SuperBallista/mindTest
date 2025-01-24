<script lang="ts">
    import Card from "$lib/components/Card.svelte";
    import { currentPage, category, totalPages, fetchPosts, list } from "$lib/stores/postStore"
    import { onMount } from "svelte";

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


    const BASE_URL = import.meta.env.VITE_BASE_URL


   onMount(() => {
        fetchPosts($category, $currentPage);
    });


</script>


<svelte:head>
    <!-- 기본 SEO 메타태그 -->
    <title>땅콩 테스트</title>
    <meta name="description" content="세상의 모든 심리테스트를 모아서 해보는 재미있는 땅콩테스트" />
    <meta name="keywords" content="심리 테스트, 성격 테스트, 결과 분석, 재미있는 테스트, 테스트 결과" />
    <meta name="author" content="땅콩 테스트" />

    <!-- Open Graph (OG) 태그: Facebook, Kakao, Instagram -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="땅콩테스트" />
    <meta property="og:description" content="세상의 모든 심리테스트를 모아서 해보는 재미있는 땅콩테스트" />
    <meta property="og:image" content="favicon.png" />
    <meta property="og:url" content={BASE_URL} />
    <meta property="og:site_name" content="땅콩 테스트" />

    <!-- Twitter Card: 트위터 공유 시 사용 -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="땅콩 테스트" />
    <meta name="twitter:description" content="세상의 모든 심리테스트를 모아서 해보는 재미있는 땅콩테스트" />
    <meta name="twitter:image" content="favicon.png" />

    <!-- Google SEO 최적화 -->
    <meta itemprop="name" content="땅콩 테스트" />
    <meta itemprop="description" content="세상의 모든 심리테스트를 모아서 해보는 재미있는 땅콩테스트" />
    <meta itemprop="image" content="favicon.png" />

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/favicon.png" />
</svelte:head>


<section class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold text-center mb-8">{$category} 테스트</h1>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each $list as test}
            <Card bind:test={test} /> <!-- ✅ Card 컴포넌트에 정확한 데이터 전달 -->
        {/each}
    </div>

    <!-- 페이지네이션 UI -->
    <div class="flex justify-center mt-8 space-x-4">
        <!-- 이전 페이지 버튼 (첫 페이지일 경우 비활성화) -->
        <button 
            class="px-4 py-2 bg-gray-300 text-gray-600 rounded"
            on:click={() => { fetchPosts($category, $currentPage - 1); }}
            disabled={$currentPage <= 1}
        >
            이전
        </button>

        <span class="px-4 py-2 bg-white border rounded">페이지 {$currentPage} / {$totalPages}</span>

        <!-- 다음 페이지 버튼 (마지막 페이지일 경우 비활성화) -->
        <button 
            class="px-4 py-2 bg-gray-300 text-gray-600 rounded"
            on:click={() => {fetchPosts($category, $currentPage + 1)}}
            disabled={$currentPage >= $totalPages}
        >
            다음
        </button>
    </div>
</section>
