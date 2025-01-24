<script lang="ts">
    import { goto } from '$app/navigation';
  import { userId, username, access } from '$lib/stores/userStore';
  import { jwtDecode } from 'jwt-decode'; // ✅ named import 사용


  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;

  function loginWithGoogle() {
    sessionStorage.setItem("origin","Google");
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile`;
      window.location.href = authUrl; // Google OAuth 페이지로 이동
  }

  const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

function loginWithKakao() {
  sessionStorage.setItem("origin","Kakao");
  const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = authUrl; // 카카오 로그인 페이지로 이동
}


  let userAccount = '';
  let password = '';

  async function handleLogin() {
      const data = { account: userAccount, password: password };

      try {
          const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data),
          });

          const result = await response.json();

          if (!response.ok) {
              throw new Error(result.message || '로그인 실패');
          }
          
          access.set(result.accessToken);
          if (typeof $access === "string") {
              const decoded: { id: string, username: string } = jwtDecode($access);
              userId.set(decoded.id);
              username.set(decoded.username);
          }

          // ✅ 로그인 성공 시 홈으로 이동
          alert('로그인 성공!');
          goto('/');

      } catch (error) {
          alert(error);
      }
  }

  function forgotPassword() {
      goto('/forgot-password'); // ✅ 비밀번호 찾기 페이지로 이동
  }



  import { onMount } from "svelte";

  function handleGoogleResponse() {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");

    if (sessionStorage.getItem("origin") === "Google")
{

    if (status === "success") {
      // ✅ 로그인 성공 → JWT 저장 후 홈으로 이동
      const token = urlParams.get("token");
      if (token) {
        access.set(token);
        const decoded = JSON.parse(atob(token.split('.')[1])); // JWT 디코딩
        userId.set(decoded.id);
        username.set(decoded.username);

        alert("로그인 성공!");
        goto("/");
      }
    } else if (status === "register_needed") {
      // ✅ 회원가입 필요 → 회원가입 페이지로 이동
      const email = urlParams.get("email");
      const googleId = urlParams.get("googleId");

      if (email && googleId) {
        goto(`/register/google?email=${email}&googleId=${googleId}`);
      }
    } else if (status === "error") {
      // ✅ 오류 발생 → 에러 메시지 표시
      const error = urlParams.get("error") || "로그인 중 오류 발생";
      alert(error);
      goto("/login"); // 새로고침
    } 
  }}


  function handleKakaoResponse() {

    
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("status");


    if (sessionStorage.getItem("origin") === "Kakao")

{    if (status === "success") {
        const token = urlParams.get("token");
        if (token) {
            access.set(token);
            const decoded = JSON.parse(atob(token.split('.')[1])); // JWT 디코딩
            userId.set(decoded.id);
            username.set(decoded.username);

            alert("카카오 로그인 성공!");
            goto("/");
        }
    } else if (status === "register_needed") {
        const kakaoId = urlParams.get("kakaoId");
        if (kakaoId) {
            goto(`/register/kakao?kakaoId=${kakaoId}`);
        }
    } else if (status === "error") {
        const error = urlParams.get("error") || "카카오 로그인 중 오류 발생";
        alert(error);
        goto("/login");
    }
}
}

  onMount(() => {
    handleGoogleResponse();
    handleKakaoResponse();
  });

</script>

<div class="flex min-h-screen items-center justify-center bg-gray-50">
  <div class="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-6">로그인</h2>

      <!-- ID 입력 -->
      <label class="block mb-2 text-gray-700">계정(이메일 주소)</label>
      <input
          type="text"
          bind:value={userAccount}
          class="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="등록된 계정 이메일 입력"
      />

      <!-- 비밀번호 입력 -->
      <label class="block mt-4 mb-2 text-gray-700">비밀번호</label>
      <input
          type="password"
          bind:value={password}
          class="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="비밀번호 입력"
      />

      <!-- 로그인 버튼 -->
      <button
          on:click={handleLogin}
          class="w-full mt-6 bg-blue-500 text-white font-semibold p-3 rounded-lg hover:bg-blue-600 transition duration-300"
      >
          로그인
      </button>

      <!-- 비밀번호 찾기 -->
      <div class="text-right mt-2">
          <button
              on:click={forgotPassword}
              class="text-blue-500 text-sm hover:underline"
          >
              비밀번호를 잊으셨나요?
          </button>
      </div>

      <!-- 소셜 로그인 -->
      <div class="mt-6 text-center text-gray-500 text-sm font-medium">소셜 로그인</div>

      <!-- Google 로그인 버튼 -->
      <button
          on:click={loginWithGoogle}
          class="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 font-medium p-3 rounded-lg mt-4 shadow-sm hover:bg-gray-100 transition duration-300 relative"
      >
          <span class="absolute left-4 text-red-500 font-bold">G</span> 구글 로그인
      </button>

      <!-- Kakao 로그인 버튼 -->
      <button
          on:click={loginWithKakao}
          class="w-full flex items-center justify-center gap-2 bg-yellow-400 text-black font-medium p-3 rounded-lg mt-2 shadow-sm hover:bg-yellow-500 transition duration-300 relative"
      >
          <span class="absolute left-4 text-black font-bold">K</span> 카카오 로그인
      </button>

      <div class="mt-4 text-center text-sm text-gray-500">
          계정이 없나요? <a href="/register" class="text-blue-500 hover:underline">회원가입</a>
      </div>
  </div>
</div>
