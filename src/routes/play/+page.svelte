<script lang="ts">
    import { goto } from "$app/navigation";
    import { quizOpen, quizIndex, quizScore, totalQuizScore, wrong } from "$lib/stores/QuestionStore";
    import { showMessageBox } from "$lib/custom/customStore";
    import { currentPage } from "$lib/stores/postStore";

    let question = $quizOpen.questions[$quizIndex]
    let choices = question.선택지


   function nextQuiz(choiceNumber:number) {

    if (Number(question.정답) === choiceNumber)
   {    quizScore.update(currentScore => currentScore + Number(question.점수 || 1));}
   else
   {     wrong.update(current => [...current, $quizIndex+1]); }
   totalQuizScore.update(currentScore => currentScore + Number(question.점수 || 1))
   if ($quizIndex + 1 === $quizOpen.questions.length)
   {
    showMessageBox("success", "결과 불러오기", "결과를 불러옵니다", "#FCD34D");
    goto("/end")}
   else {
   quizIndex.set($quizIndex + 1)
   question = $quizOpen.questions[$quizIndex]
   choices = question.선택지
}
   }
</script>



<!-- 질문 화면 -->
{#if choices && question}
<div class="flex flex-col items-center min-h-screen bg-gray-100 px-4">
  <div class="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-8">
      <h2 class="text-lg font-semibold text-gray-900 text-center mb-4">
       {$quizIndex+1}. {question.문제}
      </h2>

      <div class="space-y-3">
          {#each choices as choice, index}
              <button on:click={() => {nextQuiz(index)} } 
                      class="w-full bg-gray-700 text-white text-left px-4 py-3 rounded-lg hover:bg-gray-800">
                  {index + 1}. {choice.선택지}
              </button>
          {/each}
      </div>
  </div>
</div>
{/if}
