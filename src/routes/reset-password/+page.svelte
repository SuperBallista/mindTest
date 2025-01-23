<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";

    let token = writable<string | null>(null);
    let newPassword = writable("");
    let confirmPassword = writable("");
    let errorMessage = writable("");
    let successMessage = writable("");

    onMount(() => {
        // ✅ URL에서 토큰 추출
        const urlParams = new URLSearchParams(window.location.search);
        const extractedToken = urlParams.get("token");
        if (extractedToken) {
            token.set(extractedToken);
        } else {
            errorMessage.set("유효하지 않은 접근입니다.");
        }
    });

    async function resetPassword() {
        if ($newPassword.length < 8 || !/\d/.test($newPassword) || !/[a-zA-Z]/.test($newPassword)) {
            errorMessage.set("비밀번호는 8자 이상이며, 영문과 숫자를 포함해야 합니다.");
            return;
        }
        if ($newPassword !== $confirmPassword) {
            errorMessage.set("비밀번호 확인이 일치하지 않습니다.");
            return;
        }

        try {
            const response = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: $token, newPassword: $newPassword }),
            });

            const result = await response.json();

            if (result.success) {
                successMessage.set("비밀번호가 성공적으로 변경되었습니다!");
                setTimeout(() => goto("/login"), 2000);
            } else {
                errorMessage.set(result.message || "비밀번호 변경 실패.");
            }
        } catch (error) {
            console.error("비밀번호 변경 오류:", error);
            errorMessage.set("서버 오류가 발생했습니다.");
        }
    }
</script>

<div class="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
    <h1 class="text-2xl font-bold text-gray-800 mb-4">비밀번호 재설정</h1>

    {#if $errorMessage}
        <p class="text-red-500 mb-4">{$errorMessage}</p>
    {/if}

    {#if $successMessage}
        <p class="text-green-500 mb-4">{$successMessage}</p>
    {:else}
        <div class="mb-4">
            <label class="block font-semibold">새 비밀번호</label>
            <input type="password" bind:value={$newPassword} class="w-full p-2 border rounded" placeholder="새 비밀번호 입력" />
        </div>

        <div class="mb-4">
            <label class="block font-semibold">비밀번호 확인</label>
            <input type="password" bind:value={$confirmPassword} class="w-full p-2 border rounded" placeholder="비밀번호 확인" />
        </div>

        <button on:click={resetPassword} class="w-full bg-blue-500 text-white p-3 rounded">비밀번호 변경</button>
    {/if}
</div>
