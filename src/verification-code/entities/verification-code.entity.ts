import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('verification_codes')
@Unique(['phone', 'type'])
export class VerificationCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  phone: string;

  @Column()
  code: string;

  @Column()
  type: string;

  @Column({ default: false })
  verified: boolean;

  @Column({ type: 'timestamp' })
  expires_at: Date;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
