import { writable } from 'svelte/store';
import type { Question } from '$lib/types';
import type { Result } from '$lib/types';


// 선택지 인터페이스
export interface QuizChoice {
  선택지: string;
  이미지: string;
}

// 질문 인터페이스
export interface QuizQuestion {
  문제: string;
  이미지: string;
  선택지: QuizChoice[];
  정답: number;
  점수: number;
}

export const jsonOutput = writable<string>("");

// 최상위 JSON 응답 구조
export interface QuizResponse {
  questions: QuizQuestion[];
}

export const quizList = writable<QuizResponse>({
  questions: JSON.parse(JSON.stringify([])) // ✅ 초기값을 JSON으로 변환하여 타입 일관성 유지
});


// ✅ 질문지 및 다음 페이지 관련 상태
export const scoreObject = writable<Record<string, number>>({});
export const nextPage = writable<number>(0);
export const index = writable<number>(0);
export const ReadingPost = writable<TestData | null>(null);


export interface TestData {
  id?: string;  // ✅ 테스트 ID 추가
  category: "기타" | "연애" | "성격";
  title: string;
  description: string;
  resultType: 'score' | 'max' | 'branch';
  image: string;
  questions: Question[];
  results: Result[];
}

// ✅ 기본 테스트 구조 정의
export const defaultTestData: TestData = {
  id: "",
  category: "기타",
  title: "",
  description: "",
  resultType: "score",
  image: "",
  questions: [
    {
      text: "",
      choices: [
        { text: "", scores: 0, scoreName: "", nextQuestionId: null, resultId: null},
        { text: "", scores: 0, scoreName: "", nextQuestionId: null, resultId: null}
      ]
    }
  ],
  results: [
    {
      id: "",
      title: "",
      description: "",
      image: "",
      scoreRanges: [{ name: "", logic: "and", min: null, max: null }]
    },
    {
      id: "",
      title: "",
      description: "",
      image: "",
      scoreRanges: [{ name: "", logic: "and", min: null, max: null }]
    }
  ]
};

// ✅ testStore 생성 (타입 적용)
export const testStore = writable<TestData>(defaultTestData);

// ✅ JSON 데이터를 받아서 누락된 필드를 채우는 함수
export function normalizeTestData(data: Partial<TestData>): TestData {
  return {
    id: data.id ?? defaultTestData.id,
    category: data.category ?? defaultTestData.category,
    title: data.title ?? defaultTestData.title,
    description: data.description ?? defaultTestData.description,
    resultType: data.resultType ?? defaultTestData.resultType,
    image: data.image ?? defaultTestData.image,
    questions: Array.isArray(data.questions) && data.questions.length > 0
      ? data.questions.map(q => ({
          text: q.text ?? "",
          choices: Array.isArray(q.choices) && q.choices.length > 0
            ? q.choices.map(c => ({
                text: c.text ?? "",
                scores: typeof c.scores === "number" ? c.scores : 0,
                scoreName: c.scoreName ?? "",
                nextQuestionId: c.nextQuestionId ?? null,
                resultId: c.resultId ?? null,
                resultDBId: c.resultId != null ? data.results?.[c.resultId]?.id ?? undefined : undefined, // ✅ null 대신 undefined
                }))
            : [...defaultTestData.questions[0].choices]
        }))
      : [...defaultTestData.questions],
    results: Array.isArray(data.results) && data.results.length > 0
      ? data.results.map(r => ({
          id: r.id ?? undefined,
          title: r.title ?? "",
          description: r.description ?? "",
          image: r.image ?? "",
          scoreRanges: Array.isArray(r.scoreRanges) && r.scoreRanges.length > 0
            ? r.scoreRanges.map(range => ({
                name: range.name ?? "",
                logic: range.logic ?? "and",
                min: typeof range.min === "number" ? range.min : null,
                max: typeof range.max === "number" ? range.max : null
              }))
            : [...defaultTestData.results[0].scoreRanges]
        }))
      : [...defaultTestData.results]
  };
}

// ✅ 데이터를 testStore에 적용하는 함수 (타입 적용)
export function setTestData(data: Partial<TestData>): void {
  testStore.set(normalizeTestData(data));
}





// 퀴즈 데이터를 열기
export const quizId = writable<number|undefined>()
export const quizOpen = writable<QuizResponse>({questions:[]});
export const quizScore = writable<number>(0);
export const totalQuizScore = writable<number>(0);
export const quizIndex = writable<number>(0);
export const timer = writable<number>(0);
export const title = writable<string | null>();
export const image = writable<string | null>();
export const wrong = writable<number[]>();
export const views = writable<number>(0);
export const likes = writable<number>(0);
export const dislikes = writable<number>(0);
export const url = writable<string>();
export const editSecure = writable<"public" | "url" | "password">("public");