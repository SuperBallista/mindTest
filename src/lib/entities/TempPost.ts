import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('temp_posts')
export class TempPost {
    @PrimaryGeneratedColumn('uuid') // ✅ UUID 자동 생성
    id: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    user_id?: string; // FK → users.id (비로그인도 가능)

    @Column({ 
        type: 'enum', 
        enum: ['연애', '성격', '기타'], 
        default: '기타' 
    })
    category: '연애' | '성격' | '기타'; // ENUM 값 (연애, 성격, 기타)

    @Column({ type: 'varchar', length: 255, nullable: true })
    title?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'longtext', transformer: { 
        to: (value: any) => JSON.stringify(value), 
        from: (value: string) => JSON.parse(value) 
    }, nullable: true })
    content?: any; // JSON 형태의 임시 글 데이터 (json_valid 체크 포함)

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true, default: null })
    expires_at?: Date | null; // 일정 시간 후 자동 삭제
}
