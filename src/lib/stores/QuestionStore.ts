import { writable } from 'svelte/store';
import type { Question } from '$lib/types';
import type { Result } from '$lib/types';



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
      scoreRanges: [{ name: "", logic: "and", min: 0, max: 0 }]
    },
    {
      id: "",
      title: "",
      description: "",
      image: "",
      scoreRanges: [{ name: "", logic: "and", min: 0, max: 0 }]
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
                min: typeof range.min === "number" ? range.min : 0,
                max: typeof range.max === "number" ? range.max : 0
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








