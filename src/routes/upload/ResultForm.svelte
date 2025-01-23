<script lang="ts">
  import type { Result } from '$lib/types';
  import { testStore, access } from '$lib/stores/testStore'; // ✅ testStore 가져오기

  export let result: Result;
  export let rIndex: number;
  export let totalResult: number; // ✅ 질문 개수를 props로 받음
  export let isScoreMax: boolean
  
  let selectedFileName = "파일을 선택하세요";



async function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
        selectedFileName = "파일을 선택하세요";
        return;
    }

    let file = input.files[0];
    selectedFileName = file.name; // ✅ 파일명 표시

    // ✅ FormData를 사용하여 서버로 파일 업로드 요청
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/auth/upload-temp', {
        headers: {Authorization: `Bearer ${$access}`}, // ✅ 헤더에 액세스 토큰 추가
        method: 'POST',
        body: formData, // ✅ `Content-Type` 자동 설정됨
        credentials: 'include' // ✅ 쿠키 포함 요청

    });
        if (response.ok) {
            const data = await response.json();
            result.image = data.url
        } else {
            alert('이미지 업로드 실패!');
        }
    } catch (error) {
        console.error('이미지 업로드 중 오류 발생:', error);
        alert('이미지 업로드 중 오류가 발생했습니다.');
    }
}

function removeImage() {
    selectedFileName = "파일을 선택해주세요";
    result.image = ""
  }

  function removeResult(rIndex: number) {
  testStore.update(test => ({
    ...test, // ✅ 기존 필드(title, description, image, resultType) 유지
    results: test.results.filter((_, i) => i !== rIndex) // ✅ 특정 `rIndex`를 제외한 나머지 유지
  }));
}


  // ✅ 새로운 점수 범위 추가
  function addScoreRange() {
    result.scoreRanges = [...result.scoreRanges, { name: '', logic:'and', min: 0, max: 0 }];
  }

  // ✅ 특정 점수 범위 삭제
  function removeScoreRange(index: number) {
    result.scoreRanges = result.scoreRanges.filter((_, i) => i !== index);
  }


</script>




<div class="bg-gray-100 p-4 rounded-md mb-4">
  <h3 class="text-lg font-semibold">결과 {rIndex + 1}</h3>
  {#if $testStore.resultType != "branch"}
  <h4 class="font-semibold mt-4">{isScoreMax ? "이 점수가 다른 점수보다 가장 높을 때" : "점수 범위 설정" }</h4>
  {#each result.scoreRanges as scoreRange, sIndex}
  {#if result.scoreRanges.length > 1 && sIndex > 0}
    연산조건 : 
    <select bind:value={scoreRange.logic}>
    <option value="and">그리고</option>
    <option value="or">또는</option>
</select>
  {/if}
    <div class="flex gap-2 mb-2">
      <input bind:value={scoreRange.name} class="w-1/3 p-2 border rounded" placeholder="점수 이름 (예: 외향성)" />
      {#if isScoreMax===false}
      <input type="number" bind:value={scoreRange.min} class="w-1/4 p-2 border rounded" placeholder="최소값" />
      <input type="number" bind:value={scoreRange.max} class="w-1/4 p-2 border rounded" placeholder="최대값" />
      {/if}
      {#if result.scoreRanges.length > 1}
      <button on:click={() => removeScoreRange(sIndex)} class="text-red-500">점수 삭제</button>
      {/if}
    </div>
  {/each}
  {#if isScoreMax===false}
  <button on:click={addScoreRange} class="bg-slate-600 text-white p-2 rounded mt-2">+ 점수 범위 추가</button>
  {/if}
  

{/if}

  <label class="block mt-2">제목</label>
  <input
    bind:value={result.title}
    class="w-full p-2 border rounded mb-2"
    placeholder="결과 제목"
  />

  {#if totalResult > 2}
  <button on:click={() => removeResult(rIndex)} class="text-red-500 mt-2">결과지 삭제</button>
{/if}

  <label class="block mt-2">설명</label>
  <textarea
    bind:value={result.description}
    class="w-full p-2 border rounded mb-2 h-32"
    placeholder="결과 설명"
  />


<!-- ✅ 이미지 업로드 UI -->
<label class="block mt-2 text-gray-700 font-medium">이미지 업로드</label>

<div class="relative w-full">
    <!-- 가짜 버튼 -->
    <button 
        class="absolute inset-y-0 right-0 px-4 py-2 bg-slate-600 text-white rounded-r-md shadow-md hover:bg-slate-700 transition">
        찾아보기
    </button>

    <!-- 파일명 표시 -->
    <input 
        type="text" 
        class="w-full p-2 border rounded-l-md bg-gray-100 cursor-default text-gray-600" 
        bind:value={selectedFileName} 
        readonly />

    <!-- 실제 파일 업로드 input (숨김) -->
    <input 
        type="file" 
        class="absolute inset-0 opacity-0 w-full h-full cursor-pointer" 
        on:change={handleFileChange} />
</div>

<!-- ✅ 업로드된 이미지 미리보기 & 삭제 버튼 -->
{#if result.image}
    <div class="relative mt-4">
        <img src={result.image} alt="업로드된 이미지" class="w-full object-cover rounded shadow-md border border-gray-300" />
        
        <!-- ❌ 삭제 버튼 -->
        <button 
            on:click={removeImage}
            class="absolute top-2 right-2 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition">
            ❌
        </button>
    </div>
{/if}

</div>
  