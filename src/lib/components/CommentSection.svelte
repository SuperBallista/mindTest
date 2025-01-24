<script lang="ts">
    import { userId, username } from '$lib/stores/userStore';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    export let testId: string;
    let comment = "";
    let comments = writable<{ userId: string | null; username: string; text: string }[]>([]);

    async function addComment() {
        if (comment.trim() === "") return;

        const newComment = { userId: $userId || null, username: $username || "익명", text: comment };
        comments.update((prev) => [...prev, newComment]);

        try {
            const response = await fetch("/api/comment", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testId, userId: newComment.userId, text: newComment.text }),
            });

            if (!response.ok) {
                console.error("❌ 댓글 저장 실패");
            }
        } catch (error) {
            console.error("⚠️ 네트워크 오류:", error);
        }

        comment = "";
    }

    onMount(async () => {

        try {
            const response = await fetch(`/api/comment?testId=${testId}`);
            if (response.ok) {
                const data = await response.json();
                comments.set(data);
            } else {
                console.error("❌ 댓글 불러오기 실패");
            }
        } catch (error) {
            console.error("⚠️ 네트워크 오류:", error);
        }
    });
</script>

<div class="bg-gray-100 p-4 rounded-lg mt-4 border border-gray-300">
    <h2 class="text-lg font-semibold text-gray-800 mb-3">💬 댓글</h2>

    <!-- ✅ 댓글 입력 -->
    <div class="flex flex-wrap items-center space-x-2 mb-4">
        <input 
            type="text" 
            bind:value={comment} 
            placeholder="댓글을 입력하세요..."
            class="flex-1 min-w-0 px-4 py-2 border border-gray-400 rounded-lg focus:ring focus:ring-blue-200" 
        />
        <button on:click={addComment}
            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition shrink-0">
            등록
        </button>
    </div>

    <!-- ✅ 댓글 리스트 -->
    <div class="space-y-2">
        {#each $comments as c}
            <div class="p-3 bg-white border border-gray-300 rounded-lg shadow">
                <strong class="text-gray-800">{c.username}</strong> <!-- ✅ 프론트엔드에서 username 표시 -->
                <p class="text-gray-700">{c.text}</p>
            </div>
        {/each}
    </div>
</div>
