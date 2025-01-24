import { writable } from 'svelte/store';
import { get } from 'svelte/store';
import { jwtDecode } from 'jwt-decode'


// ✅ 사용자 관련 상태
export const userId = writable<string | null>(null);
export const access = writable<string | null>(null);
export const username = writable<string | null>(null);
export const key = writable<number>(0);
export const origin = writable<string>("");



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
  