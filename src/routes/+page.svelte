<script lang="ts">
  import Card from '$lib/components/Card.svelte'; // Card 컴포넌트 임포트

  export let data


  </script>
  
  <section class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold text-center mb-8">추천 심리테스트</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each data.list as test}
        <Card {test} />
      {/each}
    </div>
  </section>
  