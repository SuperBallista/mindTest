<script lang="ts">
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    onMount(() => {
        const params = new URLSearchParams(window.location.search);
        const target = params.get("to");

        if (target) {
            console.log("🔁 중간 페이지에서 리다이렉트:", target);
            goto(target);
        } else {
            console.error("⚠️ 유효하지 않은 리다이렉트 요청");
            goto("/"); // 잘못된 경우 홈으로 이동
        }
    });
</script>

<p>페이지 이동 중...</p>
