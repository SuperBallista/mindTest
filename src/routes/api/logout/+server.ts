import type { RequestHandler } from '@sveltejs/kit';
import { config } from "$lib/config";



export const POST: RequestHandler = async () => {

const localServer = config.LOCAL_DB;
  try {
    const headers = new Headers();
    headers.append(
      'Set-Cookie',
      `refreshToken=; HttpOnly; ${ localServer ? "" : "Secure" }; Path=/; SameSite=Strict; Max-Age=0` // ✅ 쿠키 삭제
    );

    return new Response(JSON.stringify({ success: true, message: '로그아웃 완료' }), {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('로그아웃 오류:', error);
    return new Response(JSON.stringify({ success: false, message: '로그아웃 실패' }), {
      status: 500
    });
  }
};
