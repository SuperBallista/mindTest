import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ cookies }) => {
    return new Response(JSON.stringify({ success: true, message: '토큰 검사 완료' }), { status: 200 });
};
