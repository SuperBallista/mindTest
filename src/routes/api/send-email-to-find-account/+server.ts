import type { RequestHandler } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { config } from "$lib/config";
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';


// ✅ Nodemailer 설정
const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT),
  secure: false, // TLS 사용 (port 587)
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS
  }
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email } = await request.json();
    if (!email) {
      return new Response(JSON.stringify({ success: false, message: '이메일을 입력하세요.' }), { status: 400 });
    }

    const userDB = AppDataSource.getRepository(User);
    const user = await userDB.findOne({ where: { email } });

    // ✅ 이메일 존재 여부를 명확히 알리지 않음 (보안 강화)
    if (!user) {
      return new Response(JSON.stringify({ success: true, message: '이메일이 전송되었습니다. (등록된 계정이 있을 경우)' }), { status: 200 });
    }

    // ✅ JWT 토큰 생성 (10분 유효)
    const token = jwt.sign({ email }, config.JWT_SECRET as string, { expiresIn: '10m' });

    const resetUrl = `${config.BASE_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"땅콩 테스트" <${config.EMAIL_USER}>`,
      to: email,
      subject: '비밀번호 재설정 요청',
      html: `
        <h1>비밀번호 재설정 요청</h1>
        <p>아래 링크를 10분 내에 클릭하여 비밀번호를 변경하세요:</p>
        <a href="${resetUrl}" target="_blank">비밀번호 재설정</a>
      `,
    };

    await transporter.sendMail(mailOptions);
    
    return new Response(JSON.stringify({ success: true, message: '이메일이 전송되었습니다. (등록된 계정이 있을 경우)' }), { status: 200 });
  } catch (error) {
    console.error('비밀번호 재설정 이메일 전송 실패:', error);
    return new Response(JSON.stringify({ success: false, message: '이메일 전송 실패' }), { status: 500 });
  }
};
