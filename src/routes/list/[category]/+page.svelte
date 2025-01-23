<script lang="ts">
    import Card from '$lib/components/Card.svelte';

export let data;


</script>


<section class="min-h-screen bg-gray-100 p-6">
    <h1 class="text-3xl font-bold text-center mb-8">{data.category} 테스트</h1>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each data.list as test}
        <Card {test} />
      {/each}
    </div>
  </section>
  