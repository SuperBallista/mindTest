import type { RequestHandler } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'; // ✅ ESM 방식으로 변경
import { config } from "$lib/config";
import { AppDataSource } from '$lib/ormconfig';
import { User } from '$lib/entities/User';


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
  const { email } = await request.json();

  const userDB = AppDataSource.getRepository(User)
  const isTaken = await userDB.count({where:{email}}) === 0

  if (!isTaken)
  {return new Response(JSON.stringify({ success: false, message: '사용중인 이메일입니다' }), { status: 409 });}



  // ✅ JWT 토큰 생성 (10분 유효)
  const token = jwt.sign({ email }, config.JWT_SECRET as string, { expiresIn: '10m' });

  const verificationUrl = `${config.BASE_URL}/register-verify-email?token=${token}`;

  const mailOptions = {
    from: `"땅콩" <${config.EMAIL_USER}>`,
    to: email,
    subject: '땅콩 가입을 위한 이메일 인증 요청',
    html: `
      <h1>땅콩 가입을 위한 이메일 인증</h1>
      <p>아래 링크를 10분 내에 클릭하여 이메일을 인증하세요:</p>
      <a href="${verificationUrl}" target="_blank">이메일 인증하기</a>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ success: true, message: '이메일이 전송되었습니다. 10분 내에 확인하세요.' }), { status: 200 });
  } catch (error) {
    console.error('이메일 전송 실패:', error);
    return new Response(JSON.stringify({ success: false, message: '이메일 전송 실패' }), { status: 500 });
  }
};
