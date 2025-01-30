<script lang="ts">
  import { goto } from '$app/navigation';
    import { jsonOutput, title, editSecure, url, image, timer, quizId } from '$lib/stores/QuestionStore';
    import { authFetch, showMessageBox, accessToken } from '$lib/custom/customStore';
  import { get, writable } from 'svelte/store';


  function generateRandomString(length: number) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

  let writingTitle = $title || '';
  let isPublic: 'public' | 'url' | 'password' = $editSecure || 'public'; // 기본값: 공개
  let password = '';
  let id:number | null = $quizId || null;



async function save() {
    if ($url === "") {
        url.set(generateRandomString(10)); 
    }

    if (writingTitle === "" || !get(jsonOutput)) {  // ✅ Svelte store 값 가져올 때 `get()` 사용
        showMessageBox("alert", "저장 실패", "제목과 본문이 필요합니다", "#FCD34D");
        return;
    }

    try {
        const contentData = {  
            id: id,
            title: writingTitle,
            secure: isPublic,
            url: $url,
            limit: get(timeLimitEnabled) ? get(timeLimit) : 0,  // ✅ store 값 가져오기
            content: get(jsonOutput),  // ✅ store 값 가져오기
            image: get(imageUrl),  // ✅ store 값 가져오기
            password: password,

        };

        console.log("contentData:", contentData); // ✅ 객체 확인용 로그

        const response = await authFetch("/upload/quiz", "POST", contentData);

        if (response.status === 200) {
            showMessageBox("success", "저장 성공", "저장에 성공하였습니다", "#FCD34D");
            goto("/");
        } else {
            showMessageBox("error", "오류 발생", response.statusText, "#FCD34D");
        }
        
    } catch (error) {
        showMessageBox("error", "오류 발생", `오류: ${error}`, "#FCD34D");
    }
}



function edit() {
      goto('/upload/quiz');
  }

  // ✅ 풀이 시간 제한 설정 변수
  let timeLimitEnabled = writable(false);
  let timeLimit = writable($timer || 0); // 기본값 0

  function toggleTimeLimit() {
      timeLimitEnabled.update(value => !value);
  }

// ✅ 서버에 이미지 업로드하는 함수
let imageUrl = writable<string | null>($image || null);

    async function uploadImage(file: File) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/auth/upload-temp', {
                headers: { Authorization: `Bearer ${$accessToken}` },
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.url;
            } 
        } catch (error) {
            console.error('이미지 업로드 중 오류 발생:', error);
            showMessageBox("error", "오류 발생", "오류 :" + error, "#FCD34D")
            return null;
        }
    }

async function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    const file = target.files[0];
    const uploadedUrl = await uploadImage(file);

    if (uploadedUrl !== null) {  // null이 아닌 경우에만 업데이트
        imageUrl.set(uploadedUrl);
    }
}

</script>

<div class="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
  <h2 class="text-xl font-bold text-center mb-4">퀴즈(문제) 올리기</h2>

  <!-- 제목 입력 -->
  <div class="mb-4">
      <label class="block font-semibold mb-1">제목</label>
      <input type="text" bind:value={writingTitle} placeholder="제목을 입력하세요"
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
      />
  </div>

  <!-- 주소 입력 -->
  <div class="mb-4">
      <label class="block font-semibold mb-1">주소</label>
      <input type="text" bind:value={$url} placeholder="URL 끝자리를 입력하세요 (미입력시 자동생성)"
          class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
      />
  </div>

  <!-- 공개 여부 선택 -->
  <div class="mb-4">
      <label class="block font-semibold mb-1">공개 여부</label>
      <select bind:value={isPublic} class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400">
          <option value="public">공개</option>
          <option value="url">URL을 통한 공개</option>
          <option value="password">암호 사용</option>
      </select>
  </div>

  <!-- 암호 입력 (공개 여부가 '암호 사용'일 때만 표시) -->
  {#if isPublic === 'password'}
    <div class="mb-4">
      <label class="block font-semibold mb-1">암호</label>
      <input type="password" bind:value={password} placeholder="암호를 입력하세요"
        class="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:border-blue-400"
      />
    </div>
  {/if}

  <!-- ✅ 서버 업로드 방식 적용 -->
  <div class="mb-4">
      <label class="block font-semibold mb-1">대표 이미지 업로드</label>
      <div class="relative border-2 border-dashed border-gray-300 p-4 rounded-lg text-center cursor-pointer">
          <input type="file" accept="image/*" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" on:change={handleImageUpload} />
          <p class="text-gray-500">이미지를 선택하거나 클릭하여 업로드하세요</p>
      </div>
      {#if $imageUrl}
          <div class="mt-4">
              <img src="{$imageUrl}" alt="업로드된 이미지" class="w-full rounded-lg shadow-md">
              <button class="text-red-500 mt-2" on:click={() => imageUrl.set(null)}>🗑 이미지 삭제</button>
          </div>
      {/if}
  </div>

  <!-- ✅ 풀이 시간 제한 설정 UI -->
  <div class="flex items-center mb-4">
      <label class="mr-2 font-semibold">시간 제한 설정</label>
      <div 
          class="w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition duration-300"
          on:click={toggleTimeLimit}
          class:bg-gray-300={!$timeLimitEnabled} 
          class:bg-blue-500={$timeLimitEnabled} 
      >
          <div 
              class="w-5 h-5 bg-white rounded-full shadow-md transform transition duration-300"
              class:translate-x-6={$timeLimitEnabled} 
          ></div>
      </div>
      <span class="ml-2 text-sm font-medium text-gray-700">{$timeLimitEnabled ? "활성화됨" : "비활성화됨"}</span>
  </div>  

  <!-- ✅ 시간 입력 필드 -->
  <div class="mt-2 flex items-center gap-2 {$timeLimitEnabled ? '' : 'hidden'}">
      <label for="timeLimit" class="text-sm font-medium text-gray-700">시간 제한 (초)</label>
      <input 
          type="number" 
          id="timeLimit" 
          bind:value={$timeLimit}
          min="10" step="10" 
          class="p-2 w-20 border rounded-md"
      />
  </div>

  <!-- 버튼 그룹 -->
  <div class="flex justify-between mt-4">
      <button on:click={edit} class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">문항 편집</button>
      <button on:click={save} class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">업로드</button>
  </div>
</div>
