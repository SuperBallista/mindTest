<script lang="ts">
  export let test: {
    id: string;
    title: string;
    description?: string;
    image?: string;
    viewCount?: number;
    likeCount?: number;
    dislikeCount?: number;
  };

  function markAsRead(testId: string) {
      let readTests = JSON.parse(sessionStorage.getItem('readTests') || '[]');
      if (!readTests.includes(testId)) {
          readTests.push(testId);
          sessionStorage.setItem('readTests', JSON.stringify(readTests));
      }
  }
</script>

<article class="bg-white shadow-md rounded-lg overflow-hidden transform transition hover:scale-105">
  <!-- ✅ 썸네일 이미지 -->
  <img src={test.image || "/images/basic.jpg"} alt={test.title} class="w-full h-48 object-cover" />
  
  <div class="p-4">
      <!-- ✅ 제목 -->
      <h2 class="text-xl font-semibold mb-2">{test.title}</h2>
      
      <!-- ✅ 설명 -->
      {#if test.description}
          <p class="text-gray-600 mb-4">{test.description}</p>
      {/if}

      <!-- ✅ 조회수, 추천 수, 비추천 수 -->
      <div class="flex items-center space-x-4 text-gray-600 text-sm mb-3">
          <div class="flex items-center space-x-1">
              <span>👁️</span>
              <span>{test.viewCount?.toLocaleString() || 0}</span>
          </div>
          <div class="flex items-center space-x-1 text-green-600">
              <span>👍</span>
              <span>{test.likeCount?.toLocaleString() || 0}</span>
          </div>
          <div class="flex items-center space-x-1 text-red-600">
              <span>👎</span>
              <span>{test.dislikeCount?.toLocaleString() || 0}</span>
          </div>
      </div>

      <!-- ✅ 테스트 링크 -->
      <a href={`/test/${test.id}`} 
          class="text-blue-500 hover:underline font-medium" 
          on:click={() => markAsRead(test.id)}>
          테스트 보러 가기 →
      </a>
  </div>
</article>
