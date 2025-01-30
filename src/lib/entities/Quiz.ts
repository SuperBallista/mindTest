import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("quizes")
@Unique(["url"])
export class Quiz {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "varchar", length: 255 })
    title: string;

    @Column({ type: "enum", enum: ["public", "url", "password"], default: "public" })
    secure: "public" | "url" | "password";

    @Column({ type: "varchar", length: 255, unique: true })
    url: string;

    @Column({ type: "int", nullable: true })
    limit?: number;

    @ManyToOne(() => User, (user) => user.quizzes, { nullable: true, onDelete: "SET NULL", onUpdate: "CASCADE" })
    @JoinColumn({ name: "user_id" }) // ✅ FK 컬럼명 지정
    user?: User;

    @Column({ type: "text" })
    content: string;

    @Column({ type: "varchar", length: 255, nullable: true })
    image?: string;
    
    @Column({ type: "varchar", length: 255, nullable: true })
    password?: string;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;

    @Column({ type: "int", default: 0 })
    likes: number;

    @Column({ type: "int", default: 0 })
    dislikes: number;

    @Column({ type: "int", default: 0 })
    views: number;

}
