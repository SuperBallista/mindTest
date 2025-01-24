<script lang="ts">
  import type { Choice } from '$lib/types';
  import { testStore } from '$lib/stores/QuestionStore';

  export let choice: Choice;
  export let qIndex: number;
  export let cIndex: number;
  export let resultType: 'score' | 'branch' | 'max';
  export let totalChoices: number;

  // ✅ 점수 이름과 값 자동 설정
  let key = Object.keys(choice.scores || "")[0];
  let score = Object.values(choice.scores ?? {})[0];

  if (key) {
      choice.scoreName = key;
      choice.scores = score;
  }

  // ✅ nextMode: true이면 다음 질문(nextQuestionId), false이면 결과(resultId)
  let nextMode = (!!choice.nextQuestionId);

  // ✅ Branch 타입일 때 선택지가 초기화되지 않도록 기존 값을 유지
  let selectedNextQuestion = choice.nextQuestionId ?? null;
  let selectedResult = choice.resultId ?? null;

  // ✅ Branch 타입일 때 선택 전환 (nextMode 변경)
  function clickNextMode() {
      nextMode = !nextMode;
      if (nextMode) {
          choice.nextQuestionId = selectedNextQuestion;
          choice.resultId = null; // ✅ nextMode가 true면 resultId는 null로 설정
      } else {
          choice.resultId = selectedResult;
          choice.nextQuestionId = null; // ✅ nextMode가 false면 nextQuestionId는 null로 설정
      }
  }

  // ✅ 선택지 삭제
  function removeChoice() {
      testStore.update(test => ({
          ...test,
          questions: test.questions.map((q, i) =>
              i === qIndex
                  ? { ...q, choices: q.choices.filter((_, j) => j !== cIndex) }
                  : q
          )
      }));
  }
</script>

<div class="bg-white p-3 rounded shadow mb-2">
  <input bind:value={choice.text} class="w-full p-2 border rounded" placeholder="선택지 내용" />

  {#if resultType !== 'branch'}
      <!-- ✅ 점수 입력 폼 유지 -->
      <h4 class="mt-2 font-semibold">점수 설정</h4>
      <div class="flex gap-2 mb-2">
          <input bind:value={choice.scoreName} class="w-1/2 p-2 border rounded" placeholder="점수 이름 (예: 외향성)" />
          <input type="number" bind:value={choice.scores} class="w-1/4 p-2 border rounded" placeholder="값" />
      </div>
  {:else}
      <!-- ✅ Branch 타입인 경우 토글 버튼 추가 -->
      <div class="flex items-center">
          <div class="relative w-14 h-8 rounded-full transition duration-300 cursor-pointer"
              class:bg-gray-300={!nextMode}
              class:bg-blue-500={nextMode}
              on:click={() => clickNextMode()}
          >
              <div class="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-md transition duration-300"
                  class:translate-x-6={nextMode}
              ></div>
          </div>
      </div>

      <label class="block mt-2">다음 {nextMode ? "질문" : "답변"} 선택:</label>

      <!-- ✅ nextMode에 따라 다른 값 바인딩 -->
      {#if nextMode}
          <select bind:value={choice.nextQuestionId} class="w-full p-2 border rounded"
                  on:change={() => choice.resultId = null}>
              {#each $testStore.questions as q, i}
                  {#if i !== qIndex}
                      <option value={i}>{q.text}</option>
                  {/if}
              {/each}
          </select>
      {:else}
          <select bind:value={choice.resultId} class="w-full p-2 border rounded"
                  on:change={() => choice.nextQuestionId = null}>
              {#each $testStore.results as r, i}
                  <option value={i}>{r.title}</option>
              {/each}
          </select>
      {/if}
  {/if}

  <!-- ✅ 선택지가 3개 이상일 때만 삭제 버튼 표시 -->
  {#if totalChoices > 2}
      <button on:click={removeChoice} class="text-red-500 mt-2">선택지 삭제</button>
  {/if}
</div>
