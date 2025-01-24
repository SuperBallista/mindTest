import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('temp_uploads')
export class TempUpload {
  @PrimaryGeneratedColumn('uuid') // ✅ UUID 자동 생성
  id: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    user_id?: string; // FK → users.id (비로그인도 가능)

    @Column({ type: 'text' })
    file_path: string; // 저장된 이미지 경로
    
    @Column({ name: "temp_posts_id", type: "varchar", nullable: true, default: null }) // ✅ 명확한 타입 추가
    temp_posts_id: string | null; // FK → temp_posts.id (해당 이미지가 연결된 임시 글)

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true, default: null })
    expires_at?: Date | null; // 일정 시간 후 자동 삭제
}
