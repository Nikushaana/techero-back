import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('faqs')
export class Faq {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    question: string;

    @Column()
    answer: string;

    @Column({ default: false })
    status: boolean;

    @Column({ type: 'int', default: 0 })
    order: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
