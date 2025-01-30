<script lang="ts">
    import { authFetch, showMessageBox } from '$lib/custom/customStore';
    import { testStore } from '$lib/stores/QuestionStore';
  
    // ✅ 올바른 타입 정의
    interface TempTest {
      id: string;
      // JSON으로 저장된 데이터
      title: string;
    }
  
    export let tests: TempTest[] = [];
    export let isOpen: boolean = false; // ✅ 모달 상태 기본값 false
    export let closeModal: () => void; // ✅ 모달 닫기 함수
  
    /**
     * ✅ 임시 테스트 불러오기
     */
    async function loadTest(testId: string) {
      try {
  
        const response = await authFetch(`/temp-data/${testId}`, "GET");
  
        if (response.status===200)
      {const data = await response.json()
        testStore.set(JSON.parse(data.jsonData))
        showMessageBox("success","임시자료 로드","임시자료를 불러오는데 성공하였습니다","#FCD34D")
        closeModal(); // ✅ 모달 닫기
      }

      } catch (error) {
      showMessageBox("error","오류 발생","오류:", "#FCD34D" )
      }
    }
  
    /**
     * ✅ 임시 테스트 삭제
     */
    async function deleteTest(testId: string) {
      try {
        const response = await authFetch(`/temp-data/${testId}`, 'DELETE');
  
        if (response.status===204) {
    showMessageBox("success", "임시자료 삭제", "임시자료를 삭제하는데 성공하였습니다","#FCD34D")
        } 
      } catch (error) {
        showMessageBox("error","오류 발생","오류:", "#FCD34D" )
      }
    }
  </script>
  
  {#if isOpen}
      <div class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
              <h2 class="text-2xl font-bold text-gray-800 mb-4">📝 임시 저장된 테스트 목록</h2>
              
              <!-- 닫기 버튼 -->
              <button on:click={closeModal} 
                  class="absolute top-2 right-2 text-gray-600 hover:text-gray-800 transition">
                  ❌
              </button>
  
              {#if tests.length > 0}
                  <div class="space-y-4">
                      {#each tests as test}
                          <div class="flex items-center p-4 bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
                              
                              <!-- ✅ 제목 컨테이너 (말줄임표 확실하게 적용) -->
                              <div class="flex-1 overflow-hidden">
                                  <h3 class="text-lg font-semibold text-gray-700 truncate whitespace-nowrap">{test.title}</h3>
                              </div>
  
                              <!-- ✅ 버튼 그룹 -->
                              <div class="flex-shrink-0 flex gap-2 ml-4">
                                  <button 
                                      on:click={() => loadTest(test.id)}
                                      class="px-4 py-2 text-white bg-slate-600 rounded-md shadow-md hover:bg-blue-600 transition"
                                  >
                                      불러오기
                                  </button>
  
                                  <button 
                                      on:click={() => deleteTest(test.id)}
                                      class="px-4 py-2 text-white bg-rose-500 rounded-md shadow-md hover:bg-red-600 transition"
                                  >
                                      삭제
                                  </button>
                              </div>
                          </div>
                      {/each}
                  </div>
              {:else}
                  <p class="text-gray-500 text-center">⛔ 저장된 테스트가 없습니다.</p>
              {/if}
          </div>
      </div>
  {/if}
  