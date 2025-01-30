export interface Choice {
  text: string;
  scores: number | null;
  scoreName: string | null;
  nextQuestionId: number | null;
  resultId: number | null;
  resultDBId?: string | null; // ✅ undefined 대신 null 허용
  }

export interface Question {
  text: string;
  choices: Choice[]; // ✅ 항상 Choice[]로 보장
  }

export interface Result {
  id?: string;
  title: string;
  description: string;
  image: string;
  scoreRanges: ScoreRange[];
  postId?: string;
  resultDBId?: string | null; // ✅ null 허용
}

export type ScoreRange = {
    name: string | null;
    logic: "and" | "or" | null
    min: number | null;
    max: number | null;
  };


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

