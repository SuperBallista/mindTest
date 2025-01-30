import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { Quiz } from "./Quiz";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') // ✅ UUID 자동 생성
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  username: string;

  @Column({ name: 'google_id', type: 'varchar', nullable: true, unique: true })
  googleId?: string;

  @Column({ name: 'kakao_id', type: 'varchar', nullable: true, unique: true })
  kakaoId?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true, default: () => "NULL" })
  password?: string; // ✅ 기본값 명확히 지정

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true, default: () => "NULL" })
  lastNicknameChange: Date | null;

  @OneToMany(() => Quiz, (quiz) => quiz.user)
  quizzes: Quiz[];
}
