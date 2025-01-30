<script lang="ts">

  export let test: {
    title: string;
    image: string | "";
    url: string;
    views: number;
    likes: number;
    dislikes: number;
    
  };


  
</script>

<article class="bg-white shadow-md rounded-lg overflow-hidden transform transition hover:scale-105">
  <!-- ✅ 썸네일 이미지 -->
  <img src={test.image || "/images/basic.jpg"} alt={test.title} class="w-full h-48 object-cover" />
  
  <div class="p-4">
      <!-- ✅ 제목 -->
      <h2 class="text-xl font-semibold mb-2">{test.title}</h2>


            <!-- ✅ 조회수, 추천 수, 비추천 수 -->
            <div class="flex items-center space-x-4 text-gray-600 text-sm mb-3">
                <div class="flex items-center space-x-1">
                    <span>👁️</span>
                    <span>{test.views?.toLocaleString() || 0}</span>
                </div>
                <div class="flex items-center space-x-1 text-green-600">
                    <span>👍</span>
                    <span>{test.likes?.toLocaleString() || 0}</span>
                </div>
                <div class="flex items-center space-x-1 text-red-600">
                    <span>👎</span>
                    <span>{test.dislikes?.toLocaleString() || 0}</span>
                </div>
            </div>



      <!-- ✅ 테스트 링크 -->
      <a href={`/quiz/${test.url}`} 
          class="text-blue-500 hover:underline font-medium">
          테스트 보러 가기 →
      </a>
  </div>
</article>
