<script lang="ts">
    import { authFetch } from '$lib/stores/userStore';
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
  
        const response = await authFetch<{ id: string; jsonData: string }>(`/temp-data/${testId}`, "GET");
  
        if (!response) {
          console.error("❌ 응답이 없습니다.");
          alert("서버에서 응답을 받지 못했습니다.");
          return;
        }
  
        if (response?.id) {
          // ✅ JSON 데이터 파싱 후 상태 업데이트
          testStore.set(JSON.parse(response.jsonData));
          alert('테스트 불러오기 완료!');
          closeModal(); // ✅ 모달 닫기
        } else {
          console.warn("⚠️ 해당 테스트를 찾을 수 없습니다.", response);
          alert('해당 테스트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error("❌ 테스트 불러오기 중 오류 발생:", error);
        alert('DB 불러오기 실패!');
      }
    }
  
    /**
     * ✅ 임시 테스트 삭제
     */
    async function deleteTest(testId: string) {
      try {
        const response = await authFetch<{ success: boolean }>(`/temp-data/${testId}`, 'DELETE');
  
        if (response.success) {
          alert('테스트 삭제 완료!');
          tests = tests.filter(test => test.id !== testId);
        } else {
          alert('삭제 실패!');
        }
      } catch (error) {
        console.error("❌ 테스트 삭제 중 오류 발생:", error);
        alert('삭제 요청 실패!');
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
  