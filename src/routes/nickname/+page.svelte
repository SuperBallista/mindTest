<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { authFetch } from "$lib/stores/testStore";

    let nickname = "";
    let user = null;

    async function fetchUserInfo() {
        const response = await authFetch("/api/auth/me", "GET");
        if (response.success) {
            user = response.user;
        } else {
            alert("로그인이 필요합니다.");
            goto("/login");
        }
    }

    async function submitNickname() {
        const response = await authFetch("/api/auth/set-nickname", "POST", { nickname });
        if (response.success) {
            alert("닉네임이 설정되었습니다!");
            goto("/");
        } else {
            alert("닉네임 설정 실패: " + response.message);
        }
    }

    onMount(fetchUserInfo);
</script>

<div class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-10">
    <h2 class="text-xl font-bold text-gray-800 mb-4">닉네임 설정</h2>
    <p class="text-gray-600 mb-4">계속하려면 닉네임을 입력하세요.</p>

    <input type="text" bind:value={nickname} class="w-full p-2 border rounded mb-4" placeholder="닉네임 입력" />
    <button on:click={submitNickname} class="bg-blue-500 text-white p-2 rounded w-full">닉네임 설정 완료</button>
</div>
