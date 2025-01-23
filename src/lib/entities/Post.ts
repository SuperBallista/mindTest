import { Entity, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './User';

@Entity('posts')
export class Post {
    @PrimaryColumn({type: 'varchar', length: 36}) // ✅ UUID 자동 생성
    id: string;


    @ManyToOne(() => User, { onDelete: 'CASCADE' }) // ✅ FK 관계 명확화
    @JoinColumn({ name: "user_id" }) // ✅ FK 컬럼명 지정
    user: User; // FK → users.id

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text', nullable: true })
    image?: string; // 대표 이미지 주소

    @Column({ 
        type: 'enum', 
        enum: ['연애', '성격', '기타'], 
        default: '기타' 
    })
    category: '연애' | '성격' | '기타'; // ENUM 값 (연애, 성격, 기타)

    @Column({ 
        type: 'longtext', 
        transformer: { 
            to: (value: any) => JSON.stringify(value), 
            from: (value: string) => JSON.parse(value) 
        }, 
        nullable: false 
    })
    content: any; // JSON 형태의 글 데이터 (json_valid 체크 포함)

    @Column({ type: 'int', unsigned: true, default: 0 })
    likes: number;

    @Column({ type: 'int', unsigned: true, default: 0 })
    dislikes: number;

    @Column({ type: 'int', unsigned: true, default: 0 })
    views: number;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updated_at: Date;
}
