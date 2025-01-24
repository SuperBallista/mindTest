<script lang="ts">
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import "../app.css";

</script>

<div class="flex flex-col min-h-screen">
  <!-- 헤더 -->
  <header>
      <Header />
  </header>

  <!-- 네비게이션 -->
  <nav class="bg-gray-100 p-4" aria-label="Main navigation">
      <slot name="menu" />
  </nav>

  <!-- 메인 콘텐츠 -->
  <main class="flex-1 p-4 bg-white">
      <slot />
  </main>

  <!-- 푸터 -->
  <footer>
      <Footer />
  </footer>
</div>
