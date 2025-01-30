<script lang="ts">
  import Card from '$lib/components/Card.svelte'; // Card 컴포넌트 임포트

  export let data
  const BASE_URL = import.meta.env.VITE_BASE_URL


  </script>

<svelte:head>
    <!-- 기본 SEO 메타태그 -->
    <title>땅콩 테스트</title>
    <meta name="description" content="세상의 모든 퀴즈를 모아서 해보는 재미있는 땅콩테스트" />
    <meta name="keywords" content="간단퀴즈, 객관식퀴즈 땅콩테스트" />
    <meta name="author" content="땅콩 테스트" />

    <!-- Open Graph (OG) 태그: Facebook, Kakao, Instagram -->
    <meta property="og:type" content="article" />
    <meta property="og:title" content="땅콩테스트" />
    <meta property="og:description" content="세상의 모든 퀴즈를 모아서 해보는 재미있는 땅콩테스트" />
    <meta property="og:image" content="favicon.png" />
    <meta property="og:url" content={BASE_URL} />
    <meta property="og:site_name" content="땅콩 테스트" />

    <!-- Twitter Card: 트위터 공유 시 사용 -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="땅콩 테스트" />
    <meta name="twitter:description" content="세상의 모든 퀴즈를 모아서 해보는 재미있는 땅콩테스트" />
    <meta name="twitter:image" content="favicon.png" />

    <!-- Google SEO 최적화 -->
    <meta itemprop="name" content="땅콩 테스트" />
    <meta itemprop="description" content="세상의 모든 퀴즈를 모아서 해보는 재미있는 땅콩테스트" />
    <meta itemprop="image" content="favicon.png" />

    <!-- Favicon -->
    <link rel="icon" type="image.png" href="/favicon.png" />
</svelte:head>

  
  <section class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold text-center mb-8">공개 퀴즈</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each data.list as test}
        <Card {test} />
      {/each}
    </div>
  </section>
  