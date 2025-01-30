<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";
    import { goto } from '$app/navigation';
    import { userId, username} from "$lib/stores/userStore"
    import { authFetch, accessToken, showMessageBox } from "$lib/custom/customStore";



function canChangeNickname(lastChangeDate: string | null): { allowed: boolean; message: string } {
        if (!lastChangeDate) return { allowed: true, message: "닉네임 변경 가능" };

        const now = new Date();
        const lastChange = new Date(lastChangeDate);

        const daysSinceLastChange = Math.floor((now.getTime() - lastChange.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastChange < 90) {
            return { allowed: false, message: `닉네임 변경까지 ${90 - daysSinceLastChange}일 남음` };
        }

        return { allowed: true, message: "닉네임 변경 가능" };
    }


    let userInfo = writable<{
        id: string;
        nickname: string;
        createdAt: string;
        postCount: number;
        totalLikes: number;
        lastNicknameChange: string | null;
        origin: string;
    }>({
        id: "",
        nickname: "",
        createdAt: "",
        postCount: 0,
        totalLikes: 0,
        lastNicknameChange: null,
        origin: "db",
    });

    let posts = writable<{ id: string;  title:string; viewCount: number; likeCount: number; dislikeCount: number }[]>([]);
    let editingNickname = writable(false);
    let editingPassword = writable(false);

    let newNickname = writable("");
    let currentPassword = writable(""); // 현재 비밀번호 확인용
    let newPassword = writable("");
    let confirmPassword = writable("");

    async function logout():Promise<void> {

try {
  const response = await fetch('/api/logout', {
    method: 'POST',
    credentials: 'include' // ✅ 쿠키 전송 필수
  });

  if (response.status===200) {
    accessToken.set(null); // ✅ Access Token 삭제
    userId.set(null);
    username.set(null);
    showMessageBox("success",  "로그 아웃", "로그아웃에 성공하였습니다",  "#FCD34D")
    goto('/login'); // ✅ 로그인 페이지로 이동
  } 
} catch (error) {
    showMessageBox("error",  "오류 발생", "오류 :" + error,  "#FCD34D")
}
}



    // ✅ 내 정보 불러오기
    async function loadUserInfo() {
        try {
            const response = await authFetch("/my-info", "GET");
            if (response.status===200) {
                const data = await response.json();
                userInfo.set(data.data);
                newNickname.set(data.data.nickname);       
        }
        } catch (error) {
        showMessageBox("error",  "오류 발생", "오류 :" + error,  "#FCD34D")
        }
    }

    // ✅ 내 게시글 목록 불러오기
    async function loadMyPosts() {
        try {
            const response = await authFetch("/my-posts", "GET");
            if (response.status===200) {
                const data = await response.json();
                posts.set(data.data);            
            }
        } catch (error) {
            showMessageBox("error",  "오류 발생", "오류 :" + error,  "#FCD34D")
        }
    }

    // ✅ 닉네임 변경 요청
    async function updateNickname() {
        try {
            const response = await authFetch("/update-nickname", "POST", { newNickname: $newNickname });

            if (response.status===200) {
                showMessageBox("success",  "닉네임 변경 성공", "닉네임 변경에 성공하였습니다",  "#FCD34D")
                userInfo.update(info => ({ ...info, nickname: $newNickname }));
                editingNickname.set(false); // ✅ 폼 닫기
            } 
        } catch (error) {
            showMessageBox("error",  "오류 발생", "오류 :" + error,  "#FCD34D")
        }
    }

    // ✅ 비밀번호 변경 요청
    async function updatePassword() {
        if ($newPassword !== $confirmPassword) {
            showMessageBox("alert",  "잘못된 요청", "암호가 일치하지 않습니다",  "#FCD34D")
            return;
        }

        try {
            const response = await authFetch("/update-password", "POST", {
                currentPassword: $currentPassword,
                newPassword: $newPassword,
            });

            if (response.status===200) {
                showMessageBox("success",  "변경 성공", "암호 변경에 성공하였습니다",  "#FCD34D")
                currentPassword.set("");
                newPassword.set("");
                confirmPassword.set("");
                editingPassword.set(false); // ✅ 폼 닫기
            }
        } catch (error) {
            showMessageBox("error",  "오류 발생", "오류 :" + error,  "#FCD34D")
        }
    }

    // ✅ 페이지 로드 시 내 정보 및 게시글 불러오기
    onMount(() => {
        loadUserInfo();
        loadMyPosts();
    });

    async function resign() {
      const result = await  showMessageBox(
            "input",
        "탈퇴 확인",
        "정말로 탈퇴하시겠습니까?",
        "#FCD34D",
        [{key: "check", type: "string", placeholder: "탈퇴를 입력하고 확인을 누르면 탈퇴됩니다", label: "" }])
     
        if (result.values?.check!=="탈퇴" || !(result.success))
        {
        showMessageBox("alert",  "탈퇴 취소", "탈퇴를 취소합니다",  "#FCD34D")
        return;
        }

    try {
        const response = await authFetch("/resign", "DELETE");

        if (response.status===200) {
            showMessageBox("success",  "계정 삭제", "계정 삭제에 성공하였습니다",  "#FCD34D")
            accessToken.set(null);
            userId.set(null);
            username.set(null);
            goto("/");}
    } catch (error) {
        showMessageBox("error",  "오류 발생", "오류 :" + error,  "#FCD34D")
    }
    }
</script>


<div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
    <h1 class="text-2xl font-bold mb-4 text-gray-800">내 정보</h1>

    <!-- ✅ 기본 정보 -->
    <div class="bg-gray-100 p-4 rounded-lg mb-4">
        <p><strong>📅 가입일:</strong> {$userInfo.createdAt}</p>
        
        <div class="flex items-center">
            <p><strong>🙍 닉네임:</strong></p>
            {#if $editingNickname}
                <input bind:value={$newNickname} type="text" class="ml-2 p-1 border rounded" />
                <button on:click={updateNickname} class="ml-2 bg-green-500 text-white px-3 py-1 rounded">✔</button>
                <button on:click={() => editingNickname.set(false)} class="ml-2 text-gray-500">✖</button>
            {:else}
                <span class="ml-2">{$userInfo.nickname}</span>
                {#if canChangeNickname($userInfo.lastNicknameChange).allowed}
                    <button on:click={() => editingNickname.set(true)} class="ml-2 text-blue-500 hover:underline">✏️</button>
                {/if}
            {/if}
        </div>

        <!-- ✅ 비밀번호 변경 UI -->
        <div class="flex items-center mt-2">
            {#if !$editingPassword}
                <p><strong>🔑 비밀번호:</strong></p>
            {/if}

            {#if $userInfo.origin === "db"}
                
            
            {#if $editingPassword}
                <div class="ml-2 flex flex-col space-y-2">
                    <input bind:value={$currentPassword} type="password" class="p-2 border rounded w-full" placeholder="현재 비밀번호" />
                    <input bind:value={$newPassword} type="password" class="p-2 border rounded w-full" placeholder="새 비밀번호" />
                    <input bind:value={$confirmPassword} type="password" class="p-2 border rounded w-full" placeholder="새 비밀번호 확인" />
                    
                    <div class="flex space-x-2 mt-2">
                        <button on:click={updatePassword} class="bg-green-500 text-white px-4 py-2 rounded">✔ 변경</button>
                        <button on:click={() => editingPassword.set(false)} class="text-gray-500 px-4 py-2">✖ 취소</button>
                    </div>
                </div>
            {:else}
                <span class="ml-2">******</span>
                <button on:click={() => editingPassword.set(true)} class="ml-2 text-blue-500 hover:underline">✏️</button>
            {/if}

            {:else}
            <span class="ml-2">{$userInfo.origin} 로그인🔑</span>
           {/if}

        </div>
        
        <p class="mt-2"><strong>📝 내가 쓴 게시물:</strong> {$userInfo.postCount}개</p>
        <p><strong>👍 받은 좋아요:</strong> {$userInfo.totalLikes}개</p>
    </div>
    
    <!-- ✅ 로그아웃 버튼 -->
    <div class="mt-8 flex justify-evenly">
        <button 
            on:click={logout} 
            class="bg-gray-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition-all text-lg">
            🚪 로그아웃
        </button>
    <!-- ✅ 탈퇴하기 버튼 -->
         <button 
            on:click={resign} 
            class="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-red-600 transition-all text-lg">
            🚪 탈퇴하기
        </button>
    </div>







    <hr class="my-6 border-gray-300" />

    <!-- ✅ 내가 올린 게시글 목록 -->
    <h2 class="text-xl font-semibold mt-6">내가 올린 게시글</h2>
    {#if $posts.length > 0}
        <ul class="mt-4 space-y-3">
            {#each $posts as post}
                <li class="bg-gray-100 p-3 rounded-lg shadow flex justify-between items-center">
                    <div>
                        <a href={`/quiz/${post.id}`} class="text-blue-500 hover:underline font-medium">{post.title}</a>
                        <div class="flex space-x-3 text-gray-600 text-sm mt-1">
                            <span>👁️ {post.viewCount.toLocaleString()}</span>
                            <span class="text-green-600">👍 {post.likeCount.toLocaleString()}</span>
                            <span class="text-red-600">👎 {post.dislikeCount.toLocaleString()}</span>
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
    {:else}
        <p class="text-gray-500 mt-4">게시글이 없습니다.</p>
    {/if}

</div>
