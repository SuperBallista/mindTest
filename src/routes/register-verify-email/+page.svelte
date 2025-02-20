<script lang="ts">
    import { userId, username } from '$lib/stores/userStore';
    import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { showMessageBox, accessToken } from '$lib/custom/customStore';

  let message = '';
  let isVerified = false;
  let email = '';
  let isExpired = false;

  // 회원가입 폼 데이터
  let nickname = '';
  let password = '';
  let confirmPassword = '';

  // 닉네임 중복 확인 상태
  let nicknameMessage = '';
  let isNicknameAvailable: boolean | null = null;

  // ✅ 닉네임 중복 확인 함수
  async function checkNickname() {
    if (!nickname.trim()) {
      nicknameMessage = '';
      isNicknameAvailable = null;
      return;
    }

    const response = await fetch(`/api/check-nickname?nickname=${nickname}`);
    const data = await response.json();
    isNicknameAvailable = data.isAvailable;
    nicknameMessage = data.message;
  }

  onMount(async () => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');

    if (token) {
      const response = await fetch(`/api/verify-email?token=${token}`);
      const data = await response.json();
      message = data.message;

      if (data.success) {
        isVerified = true;
        email = data.email; // ✅ 이메일 인증 API에서 이메일 반환
      }
    } else {
      message = '잘못된 인증 요청입니다.';
    }
  });

  async function register() {
    if (password !== confirmPassword) {
      showMessageBox("alert", "잘못된 요청", "암호가 일치하지 않습니다", "#FCD34D")
      return;
    }
    if (!isNicknameAvailable) {
      showMessageBox("alert","잘못된 요청", "닉네임을 확인하세요", "#FCD34D")
      return;
    }

    try{
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, nickname, password })
    });

    const data = await response.json();
    if (data.success) {
      showMessageBox( "success", "등록 성공", "계정 등록에 성공하였습니다", "#FCD34D")
      const ThisaccessToken:string = data.accessToken
      if (typeof ThisaccessToken === "string") {
        accessToken.set(ThisaccessToken);
        const decoded = JSON.parse(atob(data.accessToken.split('.')[1])); // JWT 디코딩
        userId.set(decoded.id);
        username.set(decoded.username);
        goto("/");
      }

    } } catch (error){ 
      showMessageBox( "error", "오류 발생", "오류 :" + error, "#FCD34D")
  }}

  async function resendVerificationEmail() {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await response.json();
    message = data.message;
    isExpired = false;
  }
</script>

<div class="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg text-center">
  <h2 class="text-2xl font-bold text-green-600">{message}</h2>

  {#if isVerified}
    <h3 class="text-lg font-semibold mt-4">추가 정보 입력</h3>
    
    <label class="block mt-4 text-gray-700">닉네임</label>
    <input 
      bind:value={nickname} 
      class="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
      placeholder="닉네임 입력" 
      on:input={checkNickname}
    />

    <!-- ✅ 닉네임 중복 체크 메시지 표시 -->
    {#if isNicknameAvailable === true}
      <p class="text-green-500 text-sm mt-1">{nicknameMessage}</p>
    {:else if isNicknameAvailable === false}
      <p class="text-red-500 text-sm mt-1">{nicknameMessage}</p>
    {/if}

    <label class="block mt-4 text-gray-700">비밀번호</label>
    <input type="password" bind:value={password} class="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="비밀번호 입력" />

    <label class="block mt-4 text-gray-700">비밀번호 확인</label>
    <input type="password" bind:value={confirmPassword} class="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="비밀번호 확인" />

    <button on:click={register} class="w-full mt-6 bg-blue-500 text-white font-semibold p-3 rounded-lg hover:bg-blue-600 transition duration-300">
      회원가입 완료
    </button>
  {/if}

  {#if isExpired}
    <button on:click={resendVerificationEmail} class="w-full mt-4 bg-blue-500 text-white font-semibold p-3 rounded-lg hover:bg-blue-600 transition duration-300">
      인증 이메일 다시 보내기
    </button>
  {/if}
</div>
