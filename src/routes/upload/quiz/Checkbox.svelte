<script lang="ts">
    export let checked: boolean = false;
    export let onClick: () => void; // ✅ 클릭 이벤트 함수
  
    function toggle() {
      checked = !checked;
      console.log("🟢 Checkbox 클릭됨! 현재 상태:", checked);
      onClick(); // ✅ 클릭 시 `InputData()` 실행
    }
  </script>
  
  <div class="relative w-14 h-8 flex items-center cursor-pointer select-none" on:click={toggle}>
    <div class="absolute w-full h-full rounded-full transition-all duration-200"
         class:bg-gray-300={!checked}
         class:bg-green-500={checked}></div>
  
    <div class="absolute w-6 h-6 bg-white rounded-full shadow-md transition-all duration-200"
         class:translate-x-6={checked}></div>
  </div>
  