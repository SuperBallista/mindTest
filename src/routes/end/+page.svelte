<script lang="ts">
    import { goto } from "$app/navigation";
import { title, image, totalQuizScore, quizScore, wrong, views, likes, dislikes } from "$lib/stores/QuestionStore";
    import { onMount } from "svelte";
    import { quizId } from "$lib/stores/QuestionStore";

const wrongList = $wrong.join(" ")
const resultMessage = `당신의 점수는  ${$totalQuizScore}점 만점에 ${$quizScore}점입니다. 틀린 문항은 다음과 같습니다 : ` + wrongList

let hasLiked = false;
let hasDisliked = false;

function goBack() {
    goto("/")
}



onMount(() => {
    // ✅ 로컬 스토리지에서 추천/비추천 여부 확인
    const storedLike = localStorage.getItem(`like_${$quizId}`);
    const storedDislike = localStorage.getItem(`dislike_${$quizId}`);

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
    const response = await fetch(`/api/likes/${$quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }).then(res => res.json());

    if (response.success) {
        $likes += 1;
        hasLiked = true;
        localStorage.setItem(`like_${$quizId}`, "true"); // ✅ 로컬 스토리지에 저장
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
    const response = await fetch(`/api/dislikes/${$quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    }).then(res => res.json());

    if (response.success) {
        $dislikes += 1;
        hasDisliked = true;
        localStorage.setItem(`dislike_${$quizId}`, "true"); // ✅ 로컬 스토리지에 저장
    } else {
        console.error("❌ 비추천 요청 실패:", response);
        alert("비추천 요청에 실패했습니다.");
    }
}




</script>


<!-- 전체 배경 -->
<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-3xl w-full bg-white shadow-lg rounded-xl p-8 border border-gray-300">
        
        <!-- 결과 제목 -->
        <h1 class="text-3xl font-bold text-gray-900 mb-5 text-center">{$title}</h1>

        <!-- 결과 이미지 -->
            <img src={$image || "/images/basic_result.jpg"} alt="이미지" 
                class="w-full h-full object-cover rounded-lg shadow-md border border-gray-300 mb-5" />

        <!-- 결과 설명 -->
        <p class="text-gray-700 text-lg mb-6 leading-relaxed">{resultMessage}</p>


        <!-- 버튼 섹션 -->
<div class="flex justify-center items-center space-x-6 text-gray-600 mb-6">
    <div class="flex items-center space-x-2">
        <span class="text-lg">👁️</span>
        <span class="text-md font-semibold">{$views.toLocaleString()}</span>
    </div>
    <button 
        class="flex items-center space-x-2 text-green-600 hover:text-green-700 transition"
        on:click={handleLike} disabled={hasLiked}>
        <span class="text-lg">👍</span>
        <span class="text-md font-semibold">{$likes.toLocaleString()}</span>
    </button>
    <button 
        class="flex items-center space-x-2 text-red-600 hover:text-red-700 transition"
        on:click={handleDislike} disabled={hasDisliked}>
        <span class="text-lg">👎</span>
        <span class="text-md font-semibold">{$dislikes.toLocaleString()}</span>
    </button>
</div>

        <!-- 버튼 그룹 -->
        <div class="flex space-x-4 justify-center">
            <button class="px-6 py-3 text-white bg-teal-500 hover:bg-teal-600 rounded-lg text-md font-semibold transition-all shadow"
                on:click={goBack}>
                돌아가기
            </button>
        </div>



    </div>
    </div>