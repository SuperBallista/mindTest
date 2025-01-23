import { User } from '$lib/entities/User';
import { AppDataSource } from '$lib/ormconfig';
import type { RequestHandler } from '@sveltejs/kit';




export const GET: RequestHandler = async ({ url }) => {
    const nickname = url.searchParams.get('nickname');
  
    if (!nickname) {
      return new Response(JSON.stringify({ success: false, isAvailable: false, message: '닉네임을 입력하세요.' }), { status: 200 });
    }

    
  const nicknameRegex = /^[ㄱ-ㅎ가-힣a-zA-Z0-9]+$/;
  if (!nicknameRegex.test(nickname) || nickname.length < 2 || nickname.length > 20) {
    return new Response(JSON.stringify({ success: true, isAvailable: false, message: '닉네임은 한글, 영어, 숫자로만 구성되며 2~20자여야 합니다.' }), { status: 200 });
  }
  
    const userDB = AppDataSource.getRepository(User);
    const isTaken = await userDB.count({ where: { username: nickname } }) > 0;
  
    return new Response(JSON.stringify({
      success: true,
      isAvailable: !isTaken,
      message: isTaken ? '이미 사용 중인 닉네임입니다.' : '사용 가능한 닉네임입니다.'
    }), { status: 200 });
  };
  