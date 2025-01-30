<script lang="ts">
    import { goto } from "$app/navigation";
    import { quizOpen, quizIndex, quizScore, totalQuizScore, wrong, timer } from "$lib/stores/QuestionStore";
    import { showMessageBox } from "$lib/custom/customStore";
    import { onDestroy, onMount } from "svelte";

    let question = $quizOpen.questions[$quizIndex];
    let choices = question.선택지;

    let showModal = false;
    let modalImage = "";

    let timeLeft = $timer; // ⏳ 남은 시간 (초)
    let countdown: ReturnType<typeof setInterval>; // ⏳ 타이머 변수

    // ⏳ 타이머 시작
    function startTimer() {
        clearInterval(countdown);
        timeLeft = $timer;

        countdown = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft -= 1;
            } else {
                clearInterval(countdown);
                endQuiz(); // ⏳ 시간이 다 되면 종료
            }
        }, 1000);
    }


  // ⏳ 초 → "MM:SS" 또는 "HH:MM:SS" 변환 함수
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  }

    // ❌ 제한 시간 초과 시 종료
    function endQuiz() {
        showMessageBox("alert", "시간 초과!", "제한 시간이 초과되었습니다.", "#FCD34D");

        // 🏆 전체 총점 계산
        let totalScore = $quizOpen.questions.reduce((acc, q) => acc + Number(q.점수 || 1), 0);
        totalQuizScore.set(totalScore);

        goto("/end");
    }

    function nextQuiz(choiceNumber: number) {
        clearInterval(countdown); // ⏳ 기존 타이머 정지

        if (Number(question.정답) === choiceNumber) {
            quizScore.update(currentScore => currentScore + Number(question.점수 || 1));
        } else {
            wrong.update(current => [...current, $quizIndex + 1]);
        }

        totalQuizScore.update(currentScore => currentScore + Number(question.점수 || 1));

        if ($quizIndex + 1 === $quizOpen.questions.length) {
            showMessageBox("success", "결과 불러오기", "결과를 불러옵니다", "#FCD34D");
            endQuiz(); // ⏳ 마지막 문제면 종료
        } else {
            quizIndex.set($quizIndex + 1);
            question = $quizOpen.questions[$quizIndex];
            choices = question.선택지;
            if ($timer !== 0)
            {startTimer();} // 🔄 다음 문제 타이머 시작
        }
    }

    function openModal(imageSrc: string) {
        modalImage = imageSrc;
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            closeModal();
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeydown);
        startTimer(); // 첫 문제 시작 시 타이머 실행
    });

    onDestroy(() => {
        window.removeEventListener("keydown", handleKeydown);
        clearInterval(countdown); // 컴포넌트 제거 시 타이머 정리
    });
</script>

{#if choices && question}
<div class="flex flex-col items-center min-h-screen bg-gray-100 px-4 py-6">
    <div class="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-8 text-center">
        <!-- ⏳ 남은 시간 표시 -->
        <div class="text-red-500 text-lg font-bold mb-2">
            ⏳ 남은 시간: {formatTime(timeLeft)}
        </div>

        {#if question.이미지}
            <img src={question.이미지} alt="문제 이미지"
                 on:click={() => openModal(question.이미지)}
                 class="w-full rounded-lg mb-4 object-cover shadow-md cursor-pointer"/>
        {/if}

        <h2 class="text-lg font-semibold text-gray-900 mb-4">
            {$quizIndex+1}. {question.문제}
        </h2>

        <div class="grid grid-cols-1 gap-4">
            {#each choices as choice, index}
                <div class="bg-gray-700 text-white rounded-lg shadow-md p-4 flex items-center space-x-3">
                    {#if choice.이미지}
                        <img src={choice.이미지} alt="선택지 이미지"
                             class="w-16 h-16 rounded-md object-cover cursor-pointer shadow-sm"
                             on:click={() => openModal(choice.이미지)} />
                    {/if}
                    <button on:click={() => nextQuiz(index)}
                            class="flex-1 text-left px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-900">
                        {index + 1}. {choice.선택지}
                    </button>
                </div>
            {/each}
        </div>
    </div>
</div>
{/if}

<!-- 🖼️ 선택지 이미지 모달 -->
{#if showModal}
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50"
         on:click={closeModal}>
        <div class="relative bg-white p-4 rounded-lg shadow-lg"
             on:click|stopPropagation>
            <button class="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
                    on:click={closeModal}>&times;</button>
            <img src={modalImage} alt="확대된 이미지" class="max-w-full max-h-[80vh] rounded-lg object-contain"/>
        </div>
    </div>
{/if}
