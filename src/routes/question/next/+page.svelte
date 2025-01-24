<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    
    onMount(() => {
        console.log("🔄 중간 페이지: /question으로 자동 이동");
        setTimeout(() => goto("/question"), 50); // 50ms 후 /question으로 이동
    });
    </script>
    
    <div class="flex flex-col items-center min-h-screen bg-gray-100 px-4">
      <div class="bg-white shadow-lg rounded-lg p-6 max-w-md w-full mt-8 text-center">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">잠시만 기다려 주세요...</h2>
          <p class="text-gray-600">다음 질문을 불러오는 중입니다.</p>
      </div>
    </div>
    