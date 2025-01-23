import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') // ✅ UUID 자동 생성
  id: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    username: string;

    @Column({ name: 'google_id', type: 'varchar', nullable: true, unique: true })
    googleId?: string; // ✅ Google 계정 ID

    @Column({ name: 'kakao_id', type: 'varchar', nullable: true, unique: true })
    kakaoId?: string; // ✅ Kakao 계정 ID

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    password?: string; // 직접 가입자를 위한 암호 (Google OAuth는 NULL)

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    lastNicknameChange: Date | null;  // ✅ 마지막 닉네임 변경 날짜
}
