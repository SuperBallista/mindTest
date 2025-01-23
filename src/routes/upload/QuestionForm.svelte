<script lang="ts">
    import type { Question } from '$lib/types';
    import ChoiceForm from './ChoiceForm.svelte';
  
    export let question: Question;
    export let qIndex: number;
    export let resultType: 'score' | 'max' | 'branch';
    export let removeQuestion: (index: number) => void;
    export let addChoice: (qIndex: number) => void;
    export let totalQuestions: number; // ✅ 질문 개수를 props로 받음
  </script>
  
  <div class="bg-gray-100 p-4 rounded-md mb-4">
    <label class="block text-lg">질문 {qIndex + 1}</label>
    <input bind:value={question.text} class="w-full p-2 border rounded mb-2" placeholder="질문 내용을 입력하세요" />
  
    <!-- ✅ 질문이 2개 이상일 때만 삭제 버튼 표시 -->
    {#if totalQuestions > 1}
      <button on:click={() => removeQuestion(qIndex)} class="text-red-500">질문지 삭제</button>
    {/if}
  
    <h3 class="text-lg font-semibold mt-3">선택지</h3>
    {#each question.choices, cIndex}
    <ChoiceForm 
      bind:choice={question.choices[cIndex]} 
      qIndex={qIndex} 
      cIndex={cIndex}
      resultType={resultType}
      totalChoices={question.choices.length}
    />
  {/each}
  
        
    <button on:click={() => addChoice(qIndex)} class="bg-teal-500 text-white p-2 rounded mt-2">+ 선택지 추가</button>
  </div>
  