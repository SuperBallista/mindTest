import type { RequestHandler } from '@sveltejs/kit';
import jwt from 'jsonwebtoken'; // ✅ ESM 방식으로 변경
import { config } from "$lib/config";


export const GET: RequestHandler = async ({ url }) => {
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response(JSON.stringify({ success: false, message: '잘못된 요청입니다.' }), { status: 400 });
  }

  try {
    // ✅ JWT 검증
    const decoded = jwt.verify(token, config.JWT_SECRET as string) as { email: string };

    return new Response(JSON.stringify({ success: true, message: '이메일 인증 성공', email: decoded.email }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: '이메일 인증이 만료되었습니다. 다시 시도하세요.' }), { status: 400 });
  }
};
