import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Post } from './Post';

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: number; // AUTO_INCREMENT

    @ManyToOne(() => Post, { onDelete: 'CASCADE' })
    @JoinColumn({ name: "post_id" }) // ✅ FK 컬럼명 명확하게 지정
    post: Post; // FK → posts.id

    @Column({ name: "user_id", type:"varchar", nullable: true }) // ✅ 비로그인 사용자는 userId가 없을 수도 있음
    userId!: string | null;

    @Column({ type: 'text' })
    content: string;

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', nullable: true, default: null })
    deleted_at?: Date | null; // 삭제된 경우 NULL이 아닌 시간 기록
}
