<script lang="ts">
    import { quizList } from '$lib/stores/QuestionStore';
    import { accessToken, closeMessageBox, showMessageBox } from '$lib/custom/customStore';
    import { get } from 'svelte/store';
    import Checkbox from './Checkbox.svelte';
    import QuizQuestion from './QuizQuestion.svelte';
    import { tick } from "svelte";
    import mammoth from "mammoth"; // ✅ DOCX 변환 라이브러리
    import { goto } from '$app/navigation';
    import { jsonOutput } from '$lib/stores/QuestionStore';


    let file: File | null = null;
    let extractedText: string = '';
    let errorMessage: string = '';
    let rawGeneratedText: string = '';
    let changeUI: boolean = false;

    interface Choice {
    선택지: string;
    이미지: string;
}

interface TempQuestion {
    문제: string;
    선택지: Choice[];
    정답: number | any;
}



    let draggedIndex: number | null = null;

function handleDragStart(event: DragEvent, index: number) {
    draggedIndex = index;
    event.dataTransfer?.setData("text/plain", index.toString());
}

function handleDragOver(event: DragEvent) {
    event.preventDefault(); // 기본 동작 방지 (드롭 허용)
}

function handleDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault();

    if (draggedIndex === null) return;

    quizList.update(state => {
        const newQuestions = [...state.questions];
        const [movedItem] = newQuestions.splice(draggedIndex as number, 1); // 기존 위치에서 제거
        newQuestions.splice(targetIndex, 0, movedItem); // 새로운 위치에 삽입
        return { ...state, questions: newQuestions };
    });

    draggedIndex = null;
}



function splitText(text: string, maxLength: number): string[] {
        const sentences = text.match(/[^.!?]+[.!?]*/g) || [text]; // 문장 단위로 분리
        const chunks: string[] = [];
        let currentChunk = "";

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxLength) {
                chunks.push(currentChunk.trim());
                currentChunk = sentence;
            } else {
                currentChunk += sentence;
            }
        }
        if (currentChunk) {
            chunks.push(currentChunk.trim());
        }

        return chunks;
    }


    async function convertToJSON() {
    errorMessage = '';
    jsonOutput.set("");
    rawGeneratedText = '';
    showMessageBox("loading","변환 중","텍스트를 json구조로 변환 중입니다", "#FCD34D")
    try {
        const maxChunkSize = 1000;
        const textChunks = splitText(extractedText, maxChunkSize);
        console.log(`🔹 분할된 텍스트 조각 수: ${textChunks.length}`);

        let allQuestions: any[] = []; // 모든 문제 데이터를 하나의 배열로 병합

        for (let i = 0; i < textChunks.length; i++) {
            console.log(`🚀 API 요청 ${i + 1}/${textChunks.length} (텍스트 길이: ${textChunks[i].length})`);

            try {
                const response = await fetch('/api/auth/convert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${get(accessToken)}`
                    },
                    body: JSON.stringify({ text: textChunks[i] }),
                    credentials: 'include'
                });

                console.log(`📤 응답 상태 코드: ${response.status}`);

                if (!response.ok) {
                    throw new Error(`❌ 서버 오류: ${response.status} ${response.statusText}`);
                }

                let rawText = await response.text();
                console.log("📥 원본 응답 데이터 (rawText):", rawText);

                // ✅ 응답이 비어있는지 확인
                if (!rawText || rawText.trim().length === 0) {
                    console.error("❌ API 응답이 비어 있음!");
                    throw new Error("❌ 서버에서 빈 응답을 반환함.");
                }

                let parsedData;
                try {
                    parsedData = JSON.parse(rawText); // 1차 JSON 파싱

                    // ✅ 이중 JSON 대응
                    if (typeof parsedData === "string") {
                        console.warn("⚠️ JSON이 문자열로 감싸져 있음. 2차 파싱 시도.");
                        parsedData = JSON.parse(parsedData);
                    }
                } catch (error) {
                    console.error(`❌ JSON 파싱 오류:`, error);
                    console.warn(`⚠️ JSON 파싱 실패! 원본 데이터 저장.`);
                    jsonOutput.set(JSON.stringify({ error: "Invalid JSON", rawResponse: rawText }));
                    return;
                }

                // ✅ `questions` 속성이 올바르게 있는지 확인
                if (parsedData && parsedData.questions && Array.isArray(parsedData.questions)) {
                    allQuestions.push(...parsedData.questions);
                    console.log(`✅ 추가된 질문들:`, parsedData.questions);
                } else {
                    console.warn(`⚠️ 'questions' 속성이 없음! 원본 데이터 확인 필요.`);
                    console.warn(`📦 rawText 데이터:`, rawText);
                    console.warn(`📦 parsedData 데이터:`, parsedData);
                }

            } catch (error) {
                console.error(`❌ ${i + 1}번째 요청 실패`, error);
                throw new Error(`API 요청 실패: ${i + 1}/${textChunks.length}번째 요청에서 오류 발생`);
            }
        }

        jsonOutput.set(JSON.stringify({ questions: allQuestions })) 
        console.log(`✅ 최종 JSON 출력:`, $jsonOutput);

        // ✅ 빈 결과물 방지 경고
        if (allQuestions.length === 0) {
            console.warn(`⚠️ 최종 질문 배열이 비어있음! API 응답 확인 필요`);
        }

    } catch (error) {
        console.log(error)

    } finally {
closeMessageBox()
    }
}



async function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) {
        console.warn("⚠️ 파일이 선택되지 않았습니다.");
        return;
    }

    file = target.files[0];
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop();

    console.log(`📂 선택된 파일: ${fileName}`);

    if (fileExtension === 'txt') {
        const reader = new FileReader();
        reader.onload = (e) => {
            extractedText = (e.target?.result as string).trim();
            console.log("✅ TXT 파일 읽기 완료");
        };
        reader.readAsText(file);
    } else if (fileExtension === 'docx') {
        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                if (!e.target?.result) {
                    throw new Error("DOCX 파일 로딩 실패");
                }
                const arrayBuffer = e.target.result as ArrayBuffer;
                const result = await mammoth.extractRawText({ arrayBuffer });
                extractedText = result.value.trim();
                console.log("✅ DOCX 변환 완료");
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            errorMessage = "DOCX 파일을 처리하는 중 오류가 발생했습니다.";
            console.error(error);
        }
    } else {
        console.warn("⚠️ 지원되지 않는 파일 형식:", fileExtension);
    }
}

    function inputJSON() {
        jsonOutput.set(extractedText);
    }


    async function InputData() {
    console.log("🚀 InputData 실행됨! 현재 changeUI 값:", changeUI);
    changeUI = !changeUI;

    try {
        if (!changeUI) {
            // 🔹 문제 UI → JSON 보기로 변경할 때
            console.log("📤 문제 데이터를 JSON으로 변환하여 저장");
            jsonOutput.set(JSON.stringify(get(quizList), null, 2)); // ✅ quizList → jsonOutput 변환
        } else {
            // 🔹 JSON 보기 → 문제 UI로 변경할 때
            if (!$jsonOutput || $jsonOutput.trim().length === 0) {
                throw new Error("❌ JSON 데이터가 비어 있습니다.");
            }

            let parsedData: { questions: any[] };
            try {
                parsedData = JSON.parse($jsonOutput);
            } catch (error) {
                console.error("❌ JSON 파싱 오류:", error);
                throw new Error("❌ JSON 데이터 변환 실패");
            }

            console.log("📥 변환된 JSON 데이터:", parsedData);

            if (!parsedData.questions || !Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
                throw new Error("❌ JSON 데이터가 올바르지 않거나 비어 있습니다.");
            }

            // ✅ 정답 필드 강제 변환 (배열 형태 유지)
            parsedData.questions = parsedData.questions.map((q: TempQuestion) => ({
                ...q,
                정답: Array.isArray(q.정답) ? q.정답 : [q.정답]
            }));

            console.log("📥 변환된 JSON 데이터 (정답 수정 후):", parsedData);

            // ✅ quizList 업데이트 (반응성 유지)
            quizList.set({ questions: structuredClone(parsedData.questions) });

            console.log("✅ quizList 업데이트 완료, 새로운 데이터:", get(quizList));
        }
    } catch (error) {
        console.error("❌ JSON 변환 오류:", error);
    }
}


function addQuestion() {
    quizList.update(state => ({
        ...state,
        questions: [
            ...state.questions,
            {
                문제: "",
                이미지: "",
                선택지: [
                    { 선택지: "", 이미지: "" },
                    { 선택지: "", 이미지: "" }
                ],
                정답: 0,
                점수: 1,
            }
        ]
    }));

    console.log("✅ 문항 추가됨");

    tick().then(() => {
        const latestIndex = get(quizList).questions.length - 1;
        document.getElementById(`question-${latestIndex}`)?.focus();
    });
}

function removeQuestion(index: number) {
    quizList.update(state => ({
        ...state,
        questions: state.questions.filter((_, i) => i !== index)
    }));
    console.log(`🚀 문항 삭제됨: ${index}`);
}

    </script>
<div class="p-6">
    {#if errorMessage}
      <h2 class="mt-4 text-xl text-red-500">오류 발생</h2>
      <p class="bg-red-100 p-4">{errorMessage}</p>
    {/if}
  
    {#if $jsonOutput}
      <h2 class="mt-4 text-xl">{changeUI ? "json 원문 보기" : "문제 UI로 변경"}</h2>
      <Checkbox checked={changeUI} onClick={InputData} />
  
      {#if changeUI}


<!-- ✅ 저장 버튼 UI -->
<button on:click={()=> {goto('/upload/quiz/info');jsonOutput.set(JSON.stringify(get(quizList), null, 2));}}
    class="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg w-full hover:bg-blue-700 transition duration-300"
>💾 문항 완성 </button>



    
      {#each $quizList.questions as mydata, index}
      <div
          class="drag-item border p-2 mb-2 cursor-pointer"
          draggable="true"
          on:dragstart={(event) => handleDragStart(event, index)}
          on:dragover={handleDragOver}
          on:drop={(event) => handleDrop(event, index)}
      >
          <QuizQuestion bind:mydata={mydata} index={index} removeQuestion={removeQuestion} />
      </div>
  {/each}  <button 
    class="mt-4 bg-green-500 text-white px-4 py-2 rounded w-full"
    on:click={addQuestion}
>
    ➕ 문항 추가
</button>

  
        
    {:else}
        <h2 class="mt-4 text-xl">변환된 문서</h2>
        <textarea class="w-full h-40 border p-2" bind:value={$jsonOutput}></textarea>
      {/if}
    
    {/if} <!-- ✅ jsonOutput에 대한 if 블록 닫기 -->

    {#if !$jsonOutput}
      <h1 class="text-2xl font-bold">문제지 파일 업로드 혹은 텍스트 추출</h1>

      <!-- 숨겨진 파일 업로드 input -->
      <input
          type="file"
          accept=".txt,.docx"
          id="file-upload"
          class="hidden"
          on:change={handleFileUpload}
      />
      
      <!-- 사용자 정의 버튼 -->
      <label
          for="file-upload"
          class="mt-4 flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold rounded-lg shadow-lg cursor-pointer hover:from-blue-600 hover:to-blue-800 transition duration-300 ease-in-out"
      >
          📂 파일 선택하기
      </label>
      
      <h2 class="mt-4 text-xl">추출된 텍스트</h2>
      <textarea placeholder="파일을 업로드하거나 여기에 텍스트를 직접 넣으세요" class="w-full h-40 border p-2" bind:value={extractedText}></textarea>
      <button class="mt-4 bg-blue-500 text-white px-4 py-2" on:click={convertToJSON}>JSON 변환(인공지능 API 사용)</button>
      <button class="mt-4 bg-blue-500 text-white px-4 py-2" on:click={inputJSON}>이미 변환된 문서입니다(인공지능 API 사용하지 않음)</button>
    {/if} <!-- ✅ jsonOutput이 없을 때의 if 블록 닫기 -->
</div>
