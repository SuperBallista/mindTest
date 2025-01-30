<script lang="ts">
    import type { QuizQuestion } from "$lib/stores/QuestionStore";
    import { jsonOutput, quizList } from "$lib/stores/QuestionStore"; 
    import { showMessageBox, accessToken } from "$lib/custom/customStore";

    export let mydata: QuizQuestion;
    export let index: number;
    let selectedIndex: number | null = mydata?.정답 ?? null;
    let score: number = mydata.점수 ?? 1;
    export let removeQuestion: (index: number) => void;

    async function uploadImage(file: File) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/auth/upload-temp', {
                headers: { Authorization: `Bearer ${$accessToken}` },
                method: 'POST',
                body: formData,
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                return data.url;
            } 
        } catch (error) {
            console.error('이미지 업로드 중 오류 발생:', error);
            showMessageBox("error", "오류 발생", "오류 :" + error, "#FCD34D");
            return null;
        }
    }

    async function updateQuestionImage(event: Event) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const file = target.files[0];
            const uploadedUrl = await uploadImage(file);
            if (uploadedUrl) {
                updateQuestion({ ...mydata, 이미지: uploadedUrl });
            }
        }
    }

    async function updateChoiceImage(event: Event, choiceIndex: number) {
        const target = event.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
            const file = target.files[0];
            const uploadedUrl = await uploadImage(file);
            if (uploadedUrl) {
                updateQuestion({
                    ...mydata,
                    선택지: mydata.선택지.map((choice, i) =>
                        i === choiceIndex ? { ...choice, 이미지: uploadedUrl } : choice
                    ),
                });
            }
        }
    }

    function addChoice() {
        updateQuestion({ ...mydata, 선택지: [...mydata.선택지, { 선택지: "", 이미지: "" }] });
    }

    function removeChoice(choiceIndex: number) {
        updateQuestion({
            ...mydata,
            선택지: mydata.선택지.filter((_, i) => i !== choiceIndex),
            정답: selectedIndex === choiceIndex ? 0 : mydata.정답,
        });
        selectedIndex = mydata.정답;
    }

    function updateAnswer(choiceIndex: number) {
        selectedIndex = choiceIndex;
        updateQuestion({ ...mydata, 정답: choiceIndex });
    }

    function updateQuestion(updatedData: QuizQuestion) {
        quizList.update(state => {
            const newQuestions = [...state.questions];
            newQuestions[index] = updatedData; // 변경된 데이터 적용
            return { ...state, questions: newQuestions };
        });
    }
</script>

<div class="p-4 border rounded shadow-md bg-white">
    <div class="flex items-center space-x-2">
        <span class="text-lg font-semibold">{index + 1}.</span>
        <input
            type="text"
            class="text-lg font-semibold border-b pb-2 w-full outline-none px-2"
            bind:value={mydata.문제}
            on:input={() => updateQuestion({ ...mydata })}
            placeholder="여기에 문제를 입력하세요"
        />
        <button 
            class="bg-red-500 text-white px-2 py-1 rounded text-xs"
            on:click={() => removeQuestion(index)}
        >
            ✖
        </button>
    </div>

    <div class="mt-2">
        {#if mydata.이미지}
            <img src={mydata.이미지} alt="문제 이미지" class="w-full h-40 object-cover rounded" />
            <button class="text-red-500 mt-2" on:click={() => updateQuestion({ ...mydata, 이미지: '' })}>
                🗑 이미지 삭제
            </button>
        {/if}
        <label class="mt-2 flex items-center justify-center bg-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-600 transition whitespace-nowrap">
            📷 이미지 추가
            <input type="file" accept="image/*" on:change={updateQuestionImage} class="hidden" />
        </label>
    </div>

    <ul class="mt-4 space-y-2">
        {#each mydata.선택지 as choice, choiceIndex}
            <li class="flex items-center space-x-2">
                <input 
                    type="radio" 
                    name={`question-${index}`} 
                    bind:group={selectedIndex} 
                    value={choiceIndex} 
                    on:change={() => updateAnswer(choiceIndex)} 
                />
                <input
                    type="text"
                    class="border p-2 w-full"
                    bind:value={choice.선택지}
                    on:input={() => updateQuestion({ ...mydata })}
                    placeholder="선택지 입력"
                />
                
                {#if choice.이미지}
                    <img src={choice.이미지} alt="선택지 이미지" class="w-12 h-12 object-cover rounded" />
                    <button class="text-red-500" on:click={() => updateQuestion({
                        ...mydata,
                        선택지: mydata.선택지.map((c, i) =>
                            i === choiceIndex ? { ...c, 이미지: '' } : c
                        ),
                    })}>✖</button>
                {/if}
                <label class="flex items-center justify-center bg-green-500 text-white py-1 px-3 rounded cursor-pointer hover:bg-green-600 transition whitespace-nowrap">
                    📷 이미지 추가
                    <input type="file" accept="image/*" on:change={(event) => updateChoiceImage(event, choiceIndex)} class="hidden" />
                </label>
                <button class="text-red-500 ml-2" on:click={() => removeChoice(choiceIndex)}>🗑</button>
            </li>
        {/each}
    </ul>

    <button class="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition" on:click={addChoice}>
        ➕ 선택지 추가
    </button>
    <p class="mt-4 text-blue-600 font-semibold">
        점수: 
        <input
            type="number"
            class="border p-2 w-auto"
            bind:value={score}
            on:input={() => updateQuestion({ ...mydata, 점수: score })}
        />점, 
        정답: {selectedIndex !== null && mydata.선택지[selectedIndex] 
            ? mydata.선택지[selectedIndex]?.선택지 ?? "정답 없음" 
            : "정답 선택 안 됨"}
    </p>
</div>
