<script lang="ts">
    import { onMount } from "svelte";
    import { userId, username } from "$lib/stores/userStore";
    import { accessToken } from "$lib/custom/customStore";
    import { goto } from '$app/navigation';

    let kakaoId = "";
    let newUsername = "";
    let loading = false;
    let errorMessage = "";

    // ✅ 닉네임 중복 확인 상태
    let nicknameMessage = "";
    let isNicknameAvailable: boolean | null = null;

    // 🔍 URL에서 kakaoId 가져오기
    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        kakaoId = params.get("kakaoId") || "";

        if (!kakaoId) {
            goto("/login?error=missing_data");
        }
    });

    // ✅ 닉네임 중복 확인 함수
    async function checkNickname() {
        if (!newUsername.trim()) {
            nicknameMessage = "";
            isNicknameAvailable = null;
            return;
        }

        const response = await fetch(`/api/check-nickname?nickname=${newUsername}`);
        const data = await response.json();
        isNicknameAvailable = data.isAvailable;
        nicknameMessage = data.message;
    }

    // 🔹 회원가입 요청 (카카오)
    async function register() {
        if (!newUsername.trim()) {
            errorMessage = "닉네임을 입력해주세요.";
            return;
        }
        if (!isNicknameAvailable) {
            errorMessage = "닉네임을 확인해주세요.";
            return;
        }

        loading = true;
        errorMessage = "";

        try {
            const res = await fetch("/api/register/kakao", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ kakaoId, username:newUsername }),
            });

            const data = await res.json();
            if (data.success) {
                const newAccessToken:string = data.accessToken
      if (typeof newAccessToken === "string") {
        accessToken.set(data.accessToken);
        const decoded = JSON.parse(atob(data.accessToken.split('.')[1])); // JWT 디코딩
        userId.set(decoded.id);
        username.set(decoded.username);
        goto("/");
      }
            } else {
                throw new Error(data.message || "회원가입 실패");
            }
        } catch (err) {
            console.error("❌ 회원가입 요청 실패:", err);
            errorMessage = "회원가입 중 오류가 발생했습니다.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
    <h2 class="text-2xl font-bold text-yellow-500">Kakao 계정으로 가입</h2>
  
    <h3 class="text-lg font-semibold mt-4 text-gray-800">추가 정보 입력</h3>
    
    <!-- 닉네임 입력 -->
    <div class="mt-4 text-left">
      <label class="block text-gray-700 font-medium">닉네임</label>
      <input 
        type="text"
        bind:value={newUsername} 
        class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none mt-1" 
        placeholder="닉네임 입력"
        on:input={checkNickname} 
      />

      <!-- ✅ 닉네임 중복 체크 메시지 -->
      {#if isNicknameAvailable === true}
        <p class="text-green-500 text-sm mt-1">{nicknameMessage}</p>
      {:else if isNicknameAvailable === false}
        <p class="text-red-500 text-sm mt-1">{nicknameMessage}</p>
      {/if}

      {#if errorMessage}
        <p class="text-red-500 text-sm mt-1">{errorMessage}</p>
      {/if}
    </div>
    
    <!-- 회원가입 버튼 -->
    <button 
      on:click={register}
      class="w-full mt-6 bg-yellow-500 text-white font-semibold p-3 rounded-lg hover:bg-yellow-600 transition duration-300 disabled:opacity-50"
      disabled={loading || isNicknameAvailable === false} 
    >
      회원가입 완료
    </button>
</div>
