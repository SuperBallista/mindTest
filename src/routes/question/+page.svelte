<script lang="ts">
import type { Choice, Result } from "$lib/types"; // ✅ 타입 가져오기
import { ReadingPost } from "$lib/stores/testStore";
import { goto } from "$app/navigation"; // ✅ SvelteKit 페이지 이동 함수


// ✅ 변수 초기화 (타입 명확하게 지정)
let index: number = 0; // 현재 질문 번호
let scores: Record<string, number> = {}; // 점수 저장 객체
let choices: Choice[] = [];
let question: string = "질문을 불러올 수 없습니다.";

// ✅ $ReadingPost가 null일 경우 대비
if ($ReadingPost===null) {
    console.warn("⚠️ $ReadingPost가 null입니다.");
} else {
    // ✅ 안전한 데이터 접근
    $: choices = $ReadingPost?.questions?.[index]?.choices ?? [];
    $: question = $ReadingPost?.questions?.[index]?.text ?? "질문을 불러올 수 없습니다.";
}

// ✅ 점수 업데이트 함수
function updateScores(scoreName: string, scoreValue: number) {
    scores[scoreName] = (scores[scoreName] || 0) + scoreValue;
    console.log(`현재 점수:`, scores);
}

// ✅ 최종 결과 찾기 (점수 조건을 따져 결과 결정)
function findMatchingResult(
    scores: Record<string, number>, 
    results: Result[], 
    postId: string, 
    resultType: 'max' | 'score' | 'branch'
): string | null {
    if (!scores || Object.keys(scores).length === 0) return null;
    if (!Array.isArray(results) || results.length === 0) return null;

    console.log("📌 전달된 postId:", postId);
    console.log("📌 results 목록:", results);
    
    // postId가 존재하는지 확인
    if ($ReadingPost){
    const filteredResults = results.filter(result => {
        return $ReadingPost.id === postId;
    });
  
    if (filteredResults.length === 0) {
        console.warn(`⚠️ 해당 postId(${postId})에 맞는 결과 없음.`);
        return null;
    }
  
    if (resultType === "branch") {
        console.warn("⚠️ 'branch' 타입 결과 매칭은 따로 처리해야 합니다.");
        return null;
    }

    if (resultType === 'max') {
        let maxScoreName: string | null = null;
        let maxScore = -Infinity;

        for (const [name, value] of Object.entries(scores)) {
            if (typeof value === 'number' && value > maxScore) {
                maxScore = value;
                maxScoreName = name;
            }
        }

        if (!maxScoreName) return null;

        for (const [index, result] of filteredResults.entries()) {
            if (!result.scoreRanges) continue;
            for (const range of result.scoreRanges) {
                if (range.name === maxScoreName) {
                    return result.resultDBId ?? null;
                }
            }
        }
    } else {
        for (const [index, result] of filteredResults.entries()) {
            if (!result.scoreRanges) continue;
            let isMatch = true;
            for (const range of result.scoreRanges) {
                if (!range.name) continue;

                const score = scores[range.name] ?? 0;
                const min = range.min ?? 0;
                const max = range.max ?? 0;

                if (score < min || score > max) {
                    isMatch = false;
                    break;
                }
            }
            if (isMatch) {
                console.log(`✅ 조건에 맞는 결과 찾음: ${result.resultDBId}`);
                return result.resultDBId ?? null;
            }
        }
    }
  }
    console.warn("⚠️ 조건에 맞는 결과를 찾을 수 없음.");
    return null;
}

// ✅ 선택지 클릭 시 동작
function next(score: number, scoreName: string, nextQ: number | null, resultId: string | null | undefined) {
    updateScores(scoreName, score);

    if (nextQ !== null && typeof nextQ === "number") {
        index = nextQ;
        choices = $ReadingPost?.questions?.[index]?.choices ?? [];
        question = $ReadingPost?.questions?.[index]?.text ?? "질문을 불러올 수 없습니다.";
    } else if (resultId !== null && resultId !== undefined) {
        goto(`/result/${resultId}`);
    } else {
        const finalResultId = findMatchingResult(scores, $ReadingPost?.results ?? [], $ReadingPost?.id ?? "", $ReadingPost?.resultType ?? "score");

        if (finalResultId) {
            goto(`/result/${finalResultId}`);
        } else {
            console.warn(`⚠️ 결과를 찾을 수 없음, 기본 페이지로 이동`);
            goto("/result/not-found");
        }
    }
}

</script>

<!-- 질문 화면 -->
{#if choices && question}
<div class="flex flex-col items-center min-h-screen bg-gray-100 px-4">
  <div class="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-8">
      <h2 class="text-lg font-semibold text-gray-900 text-center mb-4">
        {question}
      </h2>

      <div class="space-y-3">
          {#each choices as choice, i}
              <button on:click={() => next(Number(choice.scores), choice.scoreName || "", choice.nextQuestionId, choice.resultDBId)} 
                      class="w-full bg-gray-700 text-white text-left px-4 py-3 rounded-lg hover:bg-gray-800">
                  {i + 1}. {choice.text}
              </button>
          {/each}
      </div>
  </div>
</div>
{:else}
<div class="flex flex-col items-center min-h-screen bg-gray-100 px-4">
  <div class="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-8">
      <h2 class="text-lg font-semibold text-gray-900 text-center mb-4">
        질문지를 불러오는데 실패하였습니다
      </h2>
      <div class="space-y-3">
          <button on:click={() => goto("/")} class="w-full bg-gray-700 text-white text-left px-4 py-3 rounded-lg hover:bg-gray-800">
            돌아가기
          </button>
      </div>
  </div>
</div>
{/if}
