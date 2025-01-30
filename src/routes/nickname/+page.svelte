<script lang="ts">
    import { onMount } from "svelte";
    import { authFetch } from "$lib/custom/customStore";
    import { goto } from '$app/navigation';
    import { showMessageBox } from "$lib/custom/customStore";


    let nickname = "";
    let user = null;

    async function fetchUserInfo() {
        try{
        const response = await authFetch("/api/auth/me", "GET");
        if (response.status===200) {
          const data = await response.json()
          user = data
        }}
        catch (error) {
            showMessageBox("error", "오류 발생", "오류 :" + error, "#FCD34D")
        }
    }

    async function submitNickname() {

        try {
        const response = await authFetch("/api/auth/set-nickname", "POST", { nickname });
        if (response.status===200) {
            showMessageBox( "success", "닉네임 변경","닉네임을 변경하였습니다", "#FCD34D")
            goto("/");
        } }
        catch (error)
        {
            showMessageBox( "error", "오류 발생", "오류 :" + error, "#FCD34D")
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
