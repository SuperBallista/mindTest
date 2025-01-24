<script lang="ts">
    import { isEditMode, ReadingPost, scoreObject } from '$lib/stores/testStore.js';
    import { userId, testStore, authFetch } from '$lib/stores/testStore'; // ✅ 사용자 ID 저장소 가져오기
    import { goto } from "$app/navigation";
    
    const BASE_URL = import.meta.env.BASE_URL

    export let data;

    function shareTest() {
        const shareUrl = `${BASE_URL}/${data.id}`;

        if (navigator.share) {
            navigator.share({
                title: data.title,
                text: data.description,
                url: shareUrl
            })
            .then(() => console.log('✅ 공유 성공'))
            .catch((error) => console.error('❌ 공유 실패:', error));
        } else {
            copyToClipboard(shareUrl);
            alert("📋 링크가 복사되었습니다! 원하는 곳에 붙여넣기하세요.");
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text)
            .then(() => console.log('✅ 클립보드 복사 성공'))
            .catch((error) => console.error('❌ 클립보드 복사 실패:', error));
    }


async function editTest() {
   
            testStore.set(data.content);
            isEditMode.set(data.content.id);
            goto(`/upload?testId=${data.id}`);

        }


    async function deleteTest() {
        if (!confirm("정말로 삭제하시겠습니까?")) return;

        try {
            const response = await authFetch(`/test/${data.id}`, 'DELETE');

            if (response.message) {
                alert("테스트가 삭제되었습니다.");
                goto("/"); // ✅ 삭제 후 메인 페이지로 이동
            } else {
                console.error("❌ 테스트 삭제 실패");
                alert("테스트 삭제 실패!");
            }
        } catch (error) {
            console.error("❌ 서버 오류 발생:", error);
            alert("서버 오류 발생!");
        }
    }
    </script>

<svelte:head>
    <title>{data.title} - 땅콩 테스트</title>
    <meta name="description" content={data.description} />
</svelte:head>

<div class="min-h-screen bg-slate-100 flex items-center justify-center px-4">
    <div class="max-w-3xl w-full p-8 bg-white shadow-xl rounded-lg text-center border border-gray-200">
        
        <h1 class="text-3xl font-extrabold text-gray-900 mb-5">{data.title}</h1>

        <img src={data.image || "/images/basic.jpg"} alt="테스트 이미지"
            class="w-full h-64 object-cover rounded-lg shadow-md border border-gray-300 mb-5" />

        <p class="text-gray-700 text-base mb-6 leading-relaxed">{data.description}</p>
        <p class="text-gray-700 text-base mb-6 leading-relaxed">올린 사람 : {data.writerName || "삭제된 계정"}</p>

        <div class="flex space-x-4 justify-center">
            <a href="/question" on:click={() => {{scoreObject.set({})}; ReadingPost.set(data.content)}}
                class="px-6 py-3 text-white bg-rose-500 hover:bg-rose-600 rounded-lg text-lg font-semibold transition-all shadow">
                시작 🚀
            </a>
            <button on:click={shareTest} class="px-6 py-3 text-white bg-teal-500 hover:bg-teal-600 rounded-lg text-lg font-semibold transition-all shadow">
                공유 🔗
            </button>
        </div>

        <div class="flex justify-center items-center mt-6 space-x-6 text-gray-600">
            <div class="flex items-center space-x-2">
                <span class="text-lg">👁️</span>
                <span class="text-md font-semibold">{data.viewCount.toLocaleString()}</span>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-lg">👍</span>
                <span class="text-md font-semibold text-green-600">{data.likeCount.toLocaleString()}</span>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-lg">👎</span>
                <span class="text-md font-semibold text-red-600">{data.dislikeCount.toLocaleString()}</span>
            </div>
        </div>
    </div>
</div>

<!-- ✅ 작성자만 볼 수 있는 수정 / 삭제 버튼 -->
    <div class="hidden md:flex justify-center mt-4 space-x-4">
        {#if $userId === data.writerName}
        <button on:click={editTest} class="px-4 py-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-semibold transition-all shadow">
            ✏️ 수정하기
        </button>
        {/if}
        {#if $userId === data.writerName}
        <button on:click={deleteTest} class="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-all shadow">
            🗑 삭제하기
        </button>
        {/if}
    </div>
