import { Admin } from 'src/admin/entities/admin.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('admin_tokens')
export class AdminToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    token: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    @OneToOne(() => Admin, (admin) => admin.token, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'admin_id' })
    admin: Admin;
}