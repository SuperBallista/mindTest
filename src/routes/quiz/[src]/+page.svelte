<script lang="ts">
interface ResultType {
  success: boolean;
  values?: { password?: string }; // values가 optional
}

const result: ResultType = {
  success: true,
  values: { password: "secret" },
};

  import { authFetch, showMessageBox } from "$lib/custom/customStore"
    import { quizIndex, quizOpen, quizScore, timer, totalQuizScore, title, image, wrong, views, likes, dislikes, jsonOutput, url, editSecure } from "$lib/stores/QuestionStore.js";
    import { userId } from "$lib/stores/userStore.js";
    import { quizId } from "$lib/stores/QuestionStore.js";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";

  const BASE_URL = import.meta.env.VITE_BASE_URL
  quizScore.set(0);
        quizIndex.set(0);
        totalQuizScore.set(0);

export let data
quizId.set(data.id)
title.set(data.title)
image.set(data.image || "")
views.set(data.views)
likes.set(data.likes)
dislikes.set(data.dislikes)
timer.set(data.timer || 0)
url.set(data.url)
editSecure.set(data.secure)


let token: string | undefined
const description = data.title + "문제 풀이 페이지입니다"

onMount(() => {
        const params = new URLSearchParams(window.location.search);
        token = params.get("token") ?? undefined;
        console.log("🔍 `onMount()`에서 가져온 token:", token);
    });


async function startQuiz() {
    let inputPassword: string | undefined;
    wrong.set([])
    

    try {
        if (data.secure === "password") {
            const result = await showMessageBox("input", "암호 입력", "퀴즈에 접근하려면 암호를 입력해야 합니다", "#FCD34D", [
                { key: "password", type: "password", label: "", placeholder: "암호를 쓰세요" }
            ]);

            if (result.success && result.values?.password) {
                inputPassword = result.values.password;
            } else {
                return;
            }
        }

        if (!token && data.secure === "url") {
            showMessageBox("error", "잘못된 접근", "잘못된 URL로 접근하였습니다", "#FCD34D");
            return;
        }

        // ✅ fetchData가 올바르게 만들어졌는지 확인
        const fetchData = { id: $quizId, password: inputPassword, token };
        console.log("📤 서버로 보낼 데이터:", JSON.stringify(fetchData, null, 2), $quizId);

        const response = await fetch("/api/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fetchData),
        });

        if (response.status===200) {
            views.set($views + 1)
            showMessageBox("success", "퀴즈 불러오기", "퀴즈를 불러옵니다", "#FCD34D");
        }
        else if (response.status===403){
            showMessageBox("alert", "암호 오류", "암호가 잘못 입력되었습니다", "#FCD34D");
        }

        const quizData = await response.json();

        quizOpen.set(JSON.parse(quizData.quiz));
        timer.set(quizData.timer);
        console.log("현재점수 :", $quizScore, "총점 :", $totalQuizScore)

    } catch (error) {
        showMessageBox("error", "오류 발생", "오류:" + error, "#FCD34D");
    } finally {
        goto("/play")
    }
}



function shareQuiz() {
    console.log($userId)
    const tokenUrl =  data.writerId === $userId ? `?token=${data.token}` : ""
        const shareUrl = BASE_URL + "/quiz/" + data.url + tokenUrl;

        if (navigator.share) {
            navigator.share({
                title: data.title,
                text: description,
                url: shareUrl
            })
            .then(() => console.log('✅ 공유 성공'))
            .catch((error) => console.error('❌ 공유 실패:', error));
        } else {
            copyToClipboard(shareUrl);
            showMessageBox("success", "주소 복사 성공", "주소를 클립보드에 복사하였습니다", "#FCD34D")
        }
    }

    function copyToClipboard(text: string) {
        navigator.clipboard.writeText(text)
            .then(() => console.log('✅ 클립보드 복사 성공'))
            .catch((error) => console.error('❌ 클립보드 복사 실패:', error));
    }


    
async function editTest() {
    try{

        const response = await authFetch("/edit","POST", {url: $url})

        if (response.status===200)
    {
        const data = await response.json()
           jsonOutput.set((data.content));
           showMessageBox("success","수정하기","수정할 자료를 불러오는데 성공하였습니다","#FCD34D")
   goto(`/upload/quiz`);
}
else if (response.status===404)
{
    showMessageBox("error", "자료 없음", `오류: 자료가 없습니다`, "#FCD34D");
}
    }
    catch (error) {
        showMessageBox("error", "오류 발생", `오류: ${error}`, "#FCD34D");
    }
}


async function deleteTest() {

const response = await showMessageBox("confirm", "삭제 확인", "정말로 삭제하시겠습니까?", "#FCD34D")

if (!response.success)
{return}

try {
   const response = await authFetch(`/test/${data.id}`, 'DELETE');

   if (response.status===200) {
    showMessageBox("success","삭제 성공","삭제에 성공하였습니다","#FCD34D")
    goto("/"); // ✅ 삭제 후 메인 페이지로 이동
   } else {
    showMessageBox("error","삭제 실패","삭제에 실패하였습니다","#FCD34D")
}
} catch (error) {
    showMessageBox("error","오류 발생","오류:", "#FCD34D" )
}
}



</script>


<svelte:head>
        <!-- 기본 SEO 메타태그 -->
        <title>{data.title} 풀이</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="퀴즈 풀이, 퀴즈 테스트 결과 분석, 재미있는 퀴즈, 퀴즈 결과" />
        <meta name="author" content="땅콩 테스트" />
    
        <!-- Open Graph (OG) 태그: Facebook, Kakao, Instagram -->
        <meta property="og:type" content="article" />
        <meta property="og:title" content={data.title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={data.image} />
        <meta property="og:url" content={`${BASE_URL}/quiz/${data.url}`} />
        <meta property="og:site_name" content="땅콩 테스트" />
    
        <!-- Twitter Card: 트위터 공유 시 사용 -->
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={data.title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={data.image} />
    
        <!-- Google SEO 최적화 -->
        <meta itemprop="name" content={data.title} />
        <meta itemprop="description" content={description} />
        <meta itemprop="image" content={data.image} />
</svelte:head>
<div class="min-h-screen bg-slate-100 flex items-center justify-center px-4">
    <div class="max-w-3xl w-full p-8 bg-white shadow-xl rounded-lg text-center border border-gray-200">
        
        <h1 class="text-3xl font-extrabold text-gray-900 mb-5">{data.title}</h1>

        <img src={data.image || "/images/basic.jpg"} alt="테스트 이미지"
            class="w-full h-64 object-cover rounded-lg shadow-md border border-gray-300 mb-5" />

        <p class="text-gray-700 text-base mb-6 leading-relaxed">{description}</p>
        <p class="text-gray-700 text-base mb-6 leading-relaxed">올린 사람 : {data.writerName || "삭제된 계정"}</p>

        <div class="flex space-x-4 justify-center">
            {#if !(data.secure==="url" && !token)}
            <span on:click={() => {startQuiz()}}
                class="px-6 py-3 text-white bg-rose-500 hover:bg-rose-600 rounded-lg text-lg font-semibold transition-all shadow">
                시작 🚀
            </span>
            {/if}
            {#if data.secure!=="password"}
            <button on:click={shareQuiz} class="px-6 py-3 text-white bg-teal-500 hover:bg-teal-600 rounded-lg text-lg font-semibold transition-all shadow">
                공유 🔗
            </button>
            {/if}
        </div>

        <div class="flex justify-center items-center mt-6 space-x-6 text-gray-600">
            <div class="flex items-center space-x-2">
                <span class="text-lg">👁️</span>
                <span class="text-md font-semibold">{data.views.toLocaleString()}</span>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-lg">👍</span>
                <span class="text-md font-semibold text-green-600">{data.likes.toLocaleString()}</span>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-lg">👎</span>
                <span class="text-md font-semibold text-red-600">{data.dislikes.toLocaleString()}</span>
            </div>
        </div>
    </div>
</div>


    <div class="hidden md:flex justify-center mt-4 space-x-4">
        {#if $userId === data.writerId}
        <button on:click={editTest} class="px-4 py-2 text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg text-sm font-semibold transition-all shadow">
            ✏️ 수정하기
        </button>
        {/if}
        {#if $userId === data.writerId}
        <button on:click={deleteTest} class="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg text-sm font-semibold transition-all shadow">
            🗑 삭제하기
        </button>
        {/if}
    </div>
