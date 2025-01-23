<script lang="ts">
import { goto } from "$app/navigation";
import CommentSection from '$lib/components/CommentSection.svelte';
import { onMount } from "svelte";

export let data;

let hasLiked = false;
let hasDisliked = false;

onMount(() => {
    // ✅ 로컬 스토리지에서 추천/비추천 여부 확인
    const storedLike = localStorage.getItem(`like_${data.id}`);
    const storedDislike = localStorage.getItem(`dislike_${data.id}`);

    hasLiked = storedLike === "true";
    hasDisliked = storedDislike === "true";
});

async function handleLike() {
    if (hasLiked) {
        alert("이미 추천을 누르셨습니다!");
        return;
    }
    if (hasDisliked) {
        alert("비추천을 이미 눌렀습니다. 먼저 비추천을 취소해주세요.");
        return;
    }

    console.log("👍 추천 클릭!");

    // ✅ 서버에 추천 요청 (fetch 사용)
    const response = await fetch(`/api/likes/${data.postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }).then(res => res.json());

    if (response.success) {
        data.likeCount += 1;
        hasLiked = true;
        localStorage.setItem(`like_${data.id}`, "true"); // ✅ 로컬 스토리지에 저장
    } else {
        console.error("❌ 추천 요청 실패:", response);
        alert("추천 요청에 실패했습니다.");
    }
}

async function handleDislike() {
    if (hasDisliked) {
        alert("이미 비추천을 누르셨습니다!");
        return;
    }
    if (hasLiked) {
        alert("추천을 이미 눌렀습니다. 먼저 추천을 취소해주세요.");
        return;
    }

    console.log("👎 비추천 클릭!");

    // ✅ 서버에 비추천 요청 (fetch 사용)
    const response = await fetch(`/api/dislikes/${data.postId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }).then(res => res.json());

    if (response.success) {
        data.dislikeCount += 1;
        hasDisliked = true;
        localStorage.setItem(`dislike_${data.id}`, "true"); // ✅ 로컬 스토리지에 저장
    } else {
        console.error("❌ 비추천 요청 실패:", response);
        alert("비추천 요청에 실패했습니다.");
    }
}

function restartTest() {
    goto(`/test/${data.postId}`);
}

function goBack() {
    goto(`/`);
}

function shareTest() {
    if (navigator.share) {
        navigator.share({
            title: data.title,
            text: data.description || "",
            url: `${data.domain}/result/${data.id}`
        })
        .then(() => console.log('✅ 공유 성공'))
        .catch((error) => console.error('❌ 공유 실패:', error));
    } else {
        navigator.clipboard.writeText(`${data.domain}/result/${data.id}`);
        alert("📋 주소가 복사되었습니다!");
    }
}
</script>

<svelte:head>
    <!-- 기본 SEO 메타태그 -->
    <title>{data.title} - 테스트 결과</title>
    <meta name="description" content={data.description} />
    <meta name="keywords" content="심리 테스트, 성격 테스트, 결과 분석, 재미있는 테스트, 테스트 결과" />
    <meta name="author" content="땅콩 테스트" />

    <!-- Open Graph (OG) 태그: Facebook, Kakao, Instagram -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content={data.title} />
    <meta property="og:description" content={data.description} />
    <meta property="og:image" content={data.image} />
    <meta property="og:url" content={`${data.domain}/result/${data.id}`} />
    <meta property="og:site_name" content="땅콩 테스트" />

    <!-- Twitter Card: 트위터 공유 시 사용 -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={data.title} />
    <meta name="twitter:description" content={data.description} />
    <meta name="twitter:image" content={data.image} />

    <!-- Google SEO 최적화 -->
    <meta itemprop="name" content={data.title} />
    <meta itemprop="description" content={data.description} />
    <meta itemprop="image" content={data.image} />

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/favicon.png" />
</svelte:head>
<!-- 전체 배경 -->
<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-3xl w-full bg-white shadow-lg rounded-xl p-8 border border-gray-300">
        
        <!-- 결과 제목 -->
        <h1 class="text-3xl font-bold text-gray-900 mb-5 text-center">{data.title}</h1>

        <!-- 결과 이미지 -->
        {#if data.image}
            <img src={data.image} alt="결과 이미지" 
                class="w-full h-64 object-cover rounded-lg shadow-md border border-gray-300 mb-5" />
        {/if}

        <!-- 결과 설명 -->
        <p class="text-gray-700 text-lg mb-6 leading-relaxed">{data.description}</p>

<!-- 버튼 섹션 -->
<div class="flex justify-center items-center space-x-6 text-gray-600 mb-6">
    <div class="flex items-center space-x-2">
        <span class="text-lg">👁️</span>
        <span class="text-md font-semibold">{data.viewCount.toLocaleString()}</span>
    </div>
    <button 
        class="flex items-center space-x-2 text-green-600 hover:text-green-700 transition"
        on:click={handleLike} disabled={hasLiked}>
        <span class="text-lg">👍</span>
        <span class="text-md font-semibold">{data.likeCount.toLocaleString()}</span>
    </button>
    <button 
        class="flex items-center space-x-2 text-red-600 hover:text-red-700 transition"
        on:click={handleDislike} disabled={hasDisliked}>
        <span class="text-lg">👎</span>
        <span class="text-md font-semibold">{data.dislikeCount.toLocaleString()}</span>
    </button>
    <button 
        class="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition"
        on:click={shareTest}>
        <span class="text-lg">🔗</span>
    </button>
</div>
        <!-- 버튼 그룹 -->
        <div class="flex space-x-4 justify-center">
            <button class="px-6 py-3 text-white bg-slate-600 hover:bg-slate-700 rounded-lg text-md font-semibold transition-all shadow"
                on:click={restartTest}>
                다시하기
            </button>
            <button class="px-6 py-3 text-white bg-teal-500 hover:bg-teal-600 rounded-lg text-md font-semibold transition-all shadow"
                on:click={goBack}>
                돌아가기
            </button>
        </div>

        <!-- 댓글 섹션 -->
        <div class="mt-8">
            <CommentSection testId={data.postId} />
        </div>

    </div>
</div>
