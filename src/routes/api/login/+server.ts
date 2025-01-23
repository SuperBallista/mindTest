import type { RequestHandler } from '@sveltejs/kit';
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { createTokens } from '$lib/auth/jwt';


export const POST: RequestHandler = async ({ request }) => {
    dotenv.config();

  try {
    const { account, password } = await request.json();

    if (!account || !password) {
      return new Response(JSON.stringify({ success: false, message: '아이디와 비밀번호를 입력하세요.' }), { status: 400 });
    }

    // ✅ 사용자 찾기
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { email:account} });

    if (!user) {
      return new Response(JSON.stringify({ success: false, message: '존재하지 않는 계정입니다.' }), { status: 401 });
    }

    // ✅ 비밀번호 검증
    const isMatch = await bcrypt.compare(password, String(user.password));
    if (!isMatch) {
      return new Response(JSON.stringify({ success: false, message: '비밀번호가 틀렸습니다.' }), { status: 401 });
    }



            // ✅ 5. 사용자가 있으면 JWT 생성 후 쿠키 저장
           const {accessToken, refreshToken, localServer} = createTokens(new User)
    


      // ✅ Refresh Token을 httpOnly 쿠키에 저장
      const headers = new Headers();
      headers.append('Set-Cookie', `refreshToken=${refreshToken}; HttpOnly; Path=/; Max-Age=${7 * 24 * 60 * 60}; ${ localServer ? null : "Secure" }; SameSite=Strict`);

      return new Response(JSON.stringify({
        success: true,
        message: '로그인 성공!',
        accessToken // ✅ 클라이언트에서 메모리에 저장
      }), { status: 200, headers });

      
  } catch (error) {
    console.error('로그인 오류:', error);
    return new Response(JSON.stringify({ success: false, message: '서버 오류가 발생했습니다.' }), { status: 500 });
  }
};
