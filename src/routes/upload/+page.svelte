<script lang="ts">
    import TemporaryTest from '$lib/components/TemporaryTest.svelte';
    import { access, authFetch, testStore, userId, isEditMode } from '$lib/stores/testStore';
    import QuestionForm from './QuestionForm.svelte';
    import ResultForm from './ResultForm.svelte';
    import { writable, get } from 'svelte/store';
    import { onMount, onDestroy } from 'svelte';
    import { goto } from "$app/navigation";    


    export const isModalOpen = writable(false);
    export const tests = writable<{ id: string; title: string }[]>([]);
    $: isScoreMax = $testStore.resultType === "max"





    function addQuestion() {
      testStore.update(store => ({
        ...store,
        questions: [...store.questions, { text: '', choices: [{ text: '', scores: 0, scoreName: "", nextQuestionId: null, resultId: null }, { text: '', scores: 0, scoreName: "", nextQuestionId: null, resultId: null }] }]
      }));
    }
  
    function removeQuestion(qIndex: number) {
      testStore.update(store => ({
        ...store,
        questions: store.questions.filter((_, i) => i !== qIndex)
      }));
    }
  
    function addChoice(qIndex: number) {
      testStore.update(store => ({
        ...store,
        questions: store.questions.map((q, i) =>
          i === qIndex
            ? { ...q, choices: [...q.choices, { text: '',  scores: 0, scoreName: "", nextQuestionId: null, resultId: null }] }
            : q
        )
      }));
    }
  
    function addResult() {
      testStore.update(store => ({
        ...store,
        results: [...store.results, { title: '', description: '', image: '', scoreRanges: [{name: "", logic: "and", min: 0 ,max: 0}] }]
      }));
    }
  
    async function submitTest() {
    try {
        const fetchData = get(testStore);
        const method = 'POST';
        const endpoint = `/upload`;

        const response = await authFetch(endpoint, method, fetchData);

        if (response.success) {
            alert($isEditMode ? '테스트 수정이 완료되었습니다!' : '테스트가 성공적으로 업로드되었습니다!');

            // ✅ 테스트 등록 또는 수정 후 testStore 초기화
            testStore.set({
                category: '기타',
                title: "",
                description: "",
                resultType: "score",
                image: "",
                questions: [
                    {
                        text: "",
                        choices: [
                            { text: "", scores: 0, scoreName: "", nextQuestionId: null, resultId: null },
                            { text: "", scores: 0, scoreName: "", nextQuestionId: null, resultId: null }
                        ]
                    }
                ],
                results: [
                    {
                        title: "",
                        description: "",
                        image: "",
                        scoreRanges: [{ name: "", logic: "and", min: 0, max: 0 }]
                    },
                    {
                        title: "",
                        description: "",
                        image: "",
                        scoreRanges: [{ name: "", logic: "and", min: 0, max: 0 }]
                    }
                ]
            });

            // ✅ 수정이면 해당 테스트 페이지로 이동, 새 등록이면 메인으로 이동
            goto($isEditMode ? `/test/${$isEditMode}` : `/`);
        } else {
            console.error("❌ 테스트 저장 실패:", response);
            alert(`오류 발생: ${response.error}`);
        }
    } catch (error) {
        console.error("❌ API 요청 중 오류 발생:", error);
        alert('서버 오류 발생!');
    }
}
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
                $testStore.image = data.url
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
        $testStore.image = ""
      }




  // ✅ 임시 데이터 MariaDB에 저장
  async function saveToDB() {
    const tempData = {
        userId: $userId,
        title: $testStore.title,
        description: $testStore.description,
        content: $testStore,
        category: $testStore.category
      }
    const response = await authFetch('/temp-data','POST',tempData);

    if (response.success) {
      alert('DB에 임시 저장 완료!');
    } else {
      alert('임시 저장에 오류가 발생하였습니다!');
    }
  }

  async function loadFromDB() {
  console.log("🟢 loadFromDB() 실행됨!"); // ✅ 실행 확인 로그

  try {
    const response = await authFetch(`/temp-data?userId=${$userId}`, 'GET');
    console.log("📌 API 응답 데이터:", response);

    if (response.success && Array.isArray(response.data)) {
      console.log("✅ 데이터 변환 시작");
const parsedData = response.data.map((test: { id: number; title: string; content: string }) => ({
        id: test.id,
        title: test.title,
        jsonData: JSON.parse(test.content) // ✅ JSON 변환 추가
      }));

      console.log("✅ 변환된 데이터:", parsedData);

      tests.set(parsedData); // ✅ 변환된 데이터 저장
      isModalOpen.set(true); // ✅ 모달 열기
      console.log("✅ 모달 열기 완료!");
    } else {
      console.warn("⚠️ 응답 데이터가 예상과 다름:", response);
      alert('DB에서 불러온 데이터가 없습니다.');
    }
  } catch (error) {
    console.error("❌ loadFromDB 요청 실패:", error);
    alert('네트워크 오류 발생!');
  }
}



  function closeModal() {
    isModalOpen.set(false); // ✅ 모달 닫기
  }

    // ✅ 클라이언트에서만 실행되도록 설정
    onMount(() => {
        isModalOpen.set(false); // 초기값 설정


        // ✅ ESC 키 감지 이벤트 리스너 추가
        document.addEventListener('keydown', handleKeydown);
    });

    // ✅ 컴포넌트가 파괴될 때 이벤트 리스너 제거
    onDestroy(() => {
        document.removeEventListener('keydown', handleKeydown);
    });

        // ✅ ESC 키를 감지하여 모달 닫기
        function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            closeModal();
        }
    }
    


</script>
  
<div class="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
  <h1 class="text-2xl font-bold mb-4 text-gray-800">{$isEditMode ? '테스트 수정' : '새 심리테스트 업로드'}</h1>

<!-- 저장 및 불러오기 버튼 -->
<button on:click={saveToDB} class="bg-slate-600 text-white p-2 rounded">임시 저장</button>
<button on:click={loadFromDB} class="bg-slate-600 text-white p-2 rounded ml-2">임시저장 불러오기</button>

  <!-- ✅ 모달 컴포넌트 -->
   {#if typeof $userId==="string" && $isModalOpen}
<TemporaryTest tests={$tests} bind:isOpen={$isModalOpen} closeModal={closeModal} />
{/if}

<label class="block m-2 text-lg">카테고리</label>
<select 
  bind:value={$testStore.category} 
  class="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
>
    <option value="연애">연애</option>
    <option value="성격">성격</option>
    <option value="기타">기타</option>

</select>
  
    <label class="block m-2 text-lg">제목</label>
    <input bind:value={$testStore.title} class="w-full p-2 border rounded mb-4" placeholder="테스트 제목을 입력하세요" />


  
    <label class="block m-2 text-lg">설명</label>
    <textarea bind:value={$testStore.description} class="w-full p-2 border rounded mb-4" placeholder="테스트 설명을 입력하세요"></textarea>

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
{#if $testStore.image}
    <div class="relative mt-4">
        <img src={$testStore.image} alt="업로드된 이미지" class="w-full object-cover rounded shadow-md border border-gray-300" />
        
        <!-- ❌ 삭제 버튼 -->
        <button 
            on:click={removeImage}
            class="absolute top-2 right-2 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition">
            ❌
        </button>
    </div>
{/if}


    <h3 class="text-lg font-semibold mt-6">결과 유형</h3>
    <div class="flex gap-4 mb-6">
      <label class="flex items-center">
        <input type="radio" bind:group={$testStore.resultType} value="score" class="mr-2" /> 점수 기반 결과
      </label>
      <label class="flex items-center">
        <input type="radio" bind:group={$testStore.resultType} value="max" class="mr-2" /> 특정 점수 최대값 결과
      </label>
      <label class="flex items-center">
        <input type="radio" bind:group={$testStore.resultType} value="branch" class="mr-2" /> 선택지 기반 결과
      </label>
    </div>
  
    <h2 class="text-xl font-semibold">질문</h2>
    {#each $testStore.questions, qIndex}
      <QuestionForm 
        bind:question={$testStore.questions[qIndex]} 
        qIndex={qIndex}
        resultType={$testStore.resultType}
        removeQuestion={removeQuestion} 
        addChoice={addChoice} 
        totalQuestions={$testStore.questions.length} 
      />
    {/each}
    <button on:click={addQuestion} class="bg-teal-500 text-white p-2 rounded mt-4">+ 질문 추가</button>
  


    <h2 class="text-xl font-semibold mt-6">결과</h2>
    {#each $testStore.results, rIndex}
    <ResultForm 
    bind:result={$testStore.results[rIndex]} 
    rIndex={rIndex}
    totalResult={$testStore.results.length}
    isScoreMax={isScoreMax}
  />    {/each}


    <button on:click={addResult} class="bg-teal-500 text-white p-2 rounded mt-4">+ 결과 추가</button>


    <button on:click={submitTest} class="w-full bg-rose-500 text-white p-3 rounded mt-6">
      {$isEditMode ? '테스트 수정하기' : '테스트 등록'}
  </button>
</div>