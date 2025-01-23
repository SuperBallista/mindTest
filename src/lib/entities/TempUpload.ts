import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { TempPost } from './TempPost';

@Entity('temp_uploads')
export class TempUpload {
    @PrimaryColumn({ type: 'char', length: 36 })
    id: string; // UUID

    @Column({ type: 'varchar', length: 255, nullable: true })
    user_id?: string; // FK → users.id (비로그인도 가능)

    @Column({ type: 'text' })
    file_path: string; // 저장된 이미지 경로

    @ManyToOne(() => TempPost, { onDelete: 'CASCADE', nullable: true }) // ✅ FK 관계 정의
    @JoinColumn({ name: "temp_posts_id" }) // ✅ FK 컬럼명을 명확하게 지정
    temp_post?: TempPost; // FK → temp_posts.id (해당 이미지가 연결된 임시 글)

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true, default: null })
    expires_at?: Date | null; // 일정 시간 후 자동 삭제
}
