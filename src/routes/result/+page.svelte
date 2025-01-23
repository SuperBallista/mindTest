<script lang="ts">
    import { onMount } from "svelte";
    import { scoreObject, nextPage } from "$lib/stores/testStore.js";
    import { goto } from "$app/navigation";

    let questionId = $nextPage; // ✅ 현재 테스트 ID

    onMount(async () => {
        let userScores = $scoreObject; // ✅ 클라이언트에서만 store 값 가져오기

        // ✅ API 요청: 현재 점수를 서버로 보내서 결과를 결정
        const response = await fetch('/api/results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questionId, userScores })
        });

        const result = await response.json();
        if (result.success) {
            goto(`/result/${result.resultId}`);
        } else {
            goto("/result/error");
        }
    });
</script>


<div class="flex justify-center items-center h-screen">
    <p class="text-xl font-bold">결과 불러오는 중...</p>
  </div>
  
