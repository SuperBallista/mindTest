import { json } from '@sveltejs/kit';
import Together from 'together-ai';
import { config } from '$lib/config';

const together = new Together({ apiKey: config.TOGETHER_AI_API_KEY });

export async function POST({ request }: { request: Request }) {
  try {
    const { text }: { text: string } = await request.json();

    const prompt: string = `Extract multiple-choice questions from the following text and return only JSON.
Do not include explanations, comments, or examples. Strictly follow this structure:

{
  "questions": [
    {
      "문제": "실제 변환된 질문 내용",
      "이미지": "",
      "선택지": [
        { "선택지": "실제 변환된 선택지1", "이미지": "" },
        { "선택지": "실제 변환된 선택지2", "이미지": "" },
        { "선택지": "실제 변환된 선택지3", "이미지": "" },
        { "선택지": "실제 변환된 선택지4", "이미지": "" }
      ],
      "정답": 실제 정답 인덱스 숫자로
    }
  ]
}

Now extract the questions from the following text:
${text}`;

    const response = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo-128K", // 🦙 Llama 3.1 8B 모델 적용
      messages: [
        { role: "system", content: "Extract multiple-choice questions from the given text and return them in valid JSON format." },
        { role: "user", content: prompt }
      ],
      max_tokens: null,
      temperature: 0.7,
      top_p: 0.7,
      top_k: 50,
      repetition_penalty: 1,
      stop: ["<|eot_id|>", "<|eom_id|>"],
      stream: false // ❌ 스트리밍 비활성화 (원하는 경우 true로 변경 가능)
    });

    console.log("Together AI 응답:", response.choices[0].message.content);
    return json(JSON.parse(response.choices[0].message.content)); // JSON 변환
  } catch (error: any) {
    return json({ error: 'API 요청 중 오류 발생', details: error.message }, { status: 500 });
  }
}
