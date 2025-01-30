<script lang="ts">
    import { onMount } from "svelte";
    import { accessToken } from "$lib/custom/customStore";
    import { goto } from "$app/navigation";
    import { authFetch, showMessageBox } from "$lib/custom/customStore";
    import { userId } from "$lib/stores/userStore";
    import { username } from "$lib/stores/userStore";
    import { jwtDecode } from "jwt-decode";
    import type { JwtPayload } from "jsonwebtoken";
    import { editSecure, image, quizId, timer, title, url } from "$lib/stores/QuestionStore"

    interface CustomJwtPayload extends JwtPayload {
  id: string;
  username: string;
}

    export let header = '땅콩 테스트';


    // ✅ 카테고리 리스트
    const categories = ["연애", "성격", "기타"];

    // ✅ Access Token 체크 함수
    async function checkRefreshToken(): Promise<void> {
        if (!$accessToken || $accessToken === "" || $accessToken === undefined) { // ✅ 모든 초기값을 체크
            try {
                const response = await authFetch('/refresh', "GET");

                if (response.status===500)
               { showMessageBox("error","서버 오류","서버 오류로 이용할 수 없습니다","#FCD34D") }

               else if (response.status===404)
               { showMessageBox("error","서버 접속 불가","서버 접속 불가로 이용할 수 없습니다","#FCD34D") }
               


            } catch (error) {
                console.error('Access Token 갱신 중 오류 발생:', error);
            }
        }
        if ($accessToken)
               {
                const  decoded = jwtDecode($accessToken) as CustomJwtPayload
                userId.set(decoded.id) 
                username.set(decoded.username)
               }

    }

    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
    }



    
// ✅ 페이지가 실행될 때 항상 토큰 체크 실행
onMount(() => {
    checkRefreshToken();
});


    
    </script>

<header class="bg-amber-300 text-stone-800 shadow-md">
    <div class="container mx-auto flex items-center justify-between p-4">
        <!-- 로고 또는 제목 -->
        <a href="/">
            <h1 class="text-2xl font-bold text-[#6D4C41]">
                <img class="logo" src="/images/logo.jpg"> {header}
            </h1>
        </a>

        <!-- 햄버거 버튼 (모바일 전용) -->
        <button class="block sm:hidden focus:outline-none" on:click={toggleMenu} aria-label="Toggle menu">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
        </button>

        <!-- 네비게이션 메뉴 -->
        <nav class="hidden sm:block">
            <ul class="flex space-x-4 items-center">
                <!-- ✅ 카테고리 리스트 활용 -->
                <!-- {#each categories as category}
                    <li>
                        <button 
                            class="hover:bg-amber-400 px-3 py-2 rounded transition duration-200"
                            on:click={() => { goto(`/list`) ; currentPage.set(1)  ; fetchPosts(category,$currentPage)} }
                        >
                            {category}
                        </button>
                    </li>
                {/each} -->

                <!-- 로그인 / 로그아웃 -->
                {#if !$accessToken}
                    <li>
                        <button 
                            class="hover:bg-amber-400 px-3 py-2 rounded transition duration-200"
                            on:click={() => goto("/login")}
                        >
                            로그인
                        </button>
                    </li>
                {:else}
                    <li>
                        <button 
                            class="hover:bg-amber-400 px-3 py-2 rounded transition duration-200"
                            on:click={() => {goto("/upload/quiz"); title.set(""); url.set(""); image.set(""); editSecure.set("public"); timer.set(0); quizId.set(undefined) }}
                        >
                            올리기
                        </button>
                    </li>
                    <li>
                        <button 
                            class="hover:bg-amber-400 px-3 py-2 rounded transition duration-200"
                            on:click={() => goto("/my-info")}
                        >
                            내정보
                        </button>
                    </li>
                {/if}
            </ul>
        </nav>
    </div>

    <!-- 드롭다운 메뉴 (모바일 전용) -->
    {#if isMenuOpen}
        <nav class="sm:hidden bg-amber-300">
            <ul class="flex flex-col items-start p-4 space-y-2">
                <!-- ✅ 카테고리 리스트 활용 -->
                <!-- {#each categories as category}
                    <li>
                        <button 
                            class="block hover:bg-amber-400 px-3 py-2 rounded transition duration-200"
                            on:click={() => { goto(`/list`) ; currentPage.set(1)  ; fetchPosts(category,$currentPage)} }
                        >
                            {category}
                        </button>
                    </li>
                {/each} -->

                <!-- 로그인 / 로그아웃 -->
                {#if !$accessToken}
                    <li>
                        <button 
                            class="block hover:bg-amber-400 px-3 py-2 rounded transition duration-200"
                            on:click={() => goto("/login")}
                        >
                            로그인
                        </button>
                    </li>
                {/if}
            </ul>
        </nav>
    {/if}
</header>

<style>
.logo {
    display: inline;
    width: 70px;
    height: 70px;
}
</style>
