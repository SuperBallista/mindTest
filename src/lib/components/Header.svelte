<script lang="ts">
    import { onMount } from "svelte";
    import { access, authFetch} from "$lib/stores/testStore";
    
    export let title = '땅콩 테스트';

    interface DecodedToken {
  id: number;
  username: string;
  exp: number; // ✅ 만료 시간 (Unix timestamp)
  iat: number;
}


 export async function checkRefreshToken():Promise<void> {
  if ($access===null )
{
  try{
    const response = await authFetch('/refresh',"GET")
    if (response.status===200) {
      console.log("서버 접속 성공")
    } 
  } catch (error) {
    console.error('Access Token 갱신 중 오류 발생:', error);
  }
}
}

let isMenuOpen = false

function toggleMenu() {
      isMenuOpen = !isMenuOpen;
    }


onMount(() => {
  checkRefreshToken();
});




  </script>
  <header class="bg-amber-300 text-stone-800 shadow-md">
    <div class="container mx-auto flex items-center justify-between p-4">
        <!-- 로고 또는 제목 -->
        <a href="/"><h1 class="text-2xl font-bold text-[#6D4C41]"><img class="logo" src="/images/logo.jpg"> {title}</h1></a>

        <!-- 햄버거 버튼 (모바일 전용) -->
        <button
            class="block sm:hidden focus:outline-none"
            on:click={toggleMenu}
            aria-label="Toggle menu"
        >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
        </button>

        <!-- 네비게이션 메뉴 -->
        <nav class="hidden sm:block">
            <ul class="flex space-x-4 items-center">
                <!-- ✅ 정적으로 카테고리 추가 -->
                <li>
                    <a href="/list/연애" class="hover:bg-amber-400 px-3 py-2 rounded transition duration-200">
                        연애
                    </a>
                </li>
                <li>
                    <a href="/list/성격" class="hover:bg-amber-400 px-3 py-2 rounded transition duration-200">
                        성격
                    </a>
                </li>
                <li>
                    <a href="/list/기타" class="hover:bg-amber-400 px-3 py-2 rounded transition duration-200">
                        기타
                    </a>
                </li>

                <!-- 로그인 / 로그아웃 -->
                {#if !$access}
                    <li>
                        <a href="/login" class="hover:bg-amber-400 px-3 py-2 rounded transition duration-200">
                            로그인
                        </a>
                    </li>
                {:else}
                    <li>
                        <a href="/upload" class="hover:bg-amber-400 px-3 py-2 rounded transition duration-200">
                            올리기
                        </a>
                    </li>
                    <li>
                        <a href="/my-info" class="hover:bg-amber-400 px-3 py-2 rounded transition duration-200">
                            내정보
                        </a>
                    </li>
                {/if}
            </ul>
        </nav>
    </div>

    <!-- 드롭다운 메뉴 (모바일 전용) -->
    {#if isMenuOpen}
        <nav class="sm:hidden bg-amber-300">
            <ul class="flex flex-col items-start p-4 space-y-2">
                <!-- ✅ 정적으로 카테고리 추가 -->
                <li>
                    <a href="/list/연애" class="block hover:bg-amber-400 px-3 py-2 rounded transition duration-200">
                        연애
                    </a>
                </li>
                <li>
                    <a href="/list/성격" class="block hover:bg-amber-400 px-3 py-2 rounded transition duration-200">
                        성격
                    </a>
                </li>
                <li>
                    <a href="/list/기타" class="block hover:bg-amber-400 px-3 py-2 rounded transition duration-200">
                        기타
                    </a>
                </li>

                <!-- 로그인 / 로그아웃 -->
                {#if !$access}
                    <li>
                        <a href="/login" class="block hover:bg-amber-400 px-3 py-2 rounded transition duration-200">
                            로그인
                        </a>
                    </li>
                {/if}
            </ul>
        </nav>
    {/if}
</header>

<style>

.logo{
    display: inline;
    width: 70px;
    height: 70px;
}

</style>