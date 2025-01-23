import { Entity, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique, PrimaryColumn } from 'typeorm';
import { Post } from './Post';

@Entity('results')
@Unique(['post', 'type']) // ✅ FK 컬럼명이 변경되었으므로 `post_id` → `post`
export class Result {
    @PrimaryColumn({type: 'varchar', length: 36}) // ✅ UUID 자동 생성
    id: string;

    @Column({type: 'varchar', length: 255})
    title: string;

    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "post_id" }) // ✅ FK 컬럼명 명확히 지정
    post: Post; // FK → posts.id

    @Column({ type: 'varchar', length: 255 })
    type: string; // 결과 유형 (예: 성격 테스트, 퀴즈 결과)

    @Column({ type: 'text', nullable: true })
    image?: string; // 결과 이미지 주소

    @Column({ type: 'text' })
    description: string;


    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}
