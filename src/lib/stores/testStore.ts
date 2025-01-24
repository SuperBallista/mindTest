import { writable, get } from 'svelte/store';
import { jwtDecode } from 'jwt-decode';
import type { Question } from '$lib/types';
import type { Result } from '$lib/types';

// ✅ 사용자 관련 상태
export const userId = writable<string | null>(null);
export const access = writable<string | null>(null);
export const username = writable<string | null>(null);
export const key = writable<number>(0);
export const countdown = writable<boolean>(false);

// ✅ 점수 및 다음 페이지 관련 상태
export const scoreObject = writable<Record<string, number>>({});
export const nextPage = writable<number>(0);
export const index = writable<number>(0);


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




// ✅ 인증 요청 함수
export async function authFetch<T = any>(endpoint: string, method: string, jsonData?: any): Promise<T> {
  const accessToken = get(access); // ✅ Svelte store에서 액세스 토큰 가져오기

  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`; // ✅ 헤더에 액세스 토큰 추가
  }

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include' // ✅ 쿠키 포함 요청
  };

  if (jsonData) {
    options.body = JSON.stringify(jsonData); // ✅ JSON 데이터 추가
  }

  try {
    const response = await fetch("/api/auth" + endpoint, options);

    // ✅ 응답을 JSON으로 바로 변환
    const data = await response.json();

    // ✅ 헤더에서 새로운 액세스 토큰 가져오기
    const newAccessToken = response.headers.get('Authorization')?.split('Bearer ')[1];

    if (newAccessToken) {
      access.set(newAccessToken); // ✅ Svelte store 업데이트
      const decode: { id: string; username: string } = jwtDecode(newAccessToken);
      userId.set(decode.id);
      username.set(decode.username);
    }

    return data;
  } catch (error) {
    console.error("❌ authFetch 요청 오류:", error);
    throw error; // ✅ 에러를 던져서 호출하는 곳에서 핸들링 가능하도록 함
  }
}


 export const isEditMode = writable<number | null> (null)


export const ReadingPost = writable<TestData | null>(null);

export const origin = writable<string>("");