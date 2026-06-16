import { Technician } from 'src/technician/entities/technician.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('technician_tokens')
export class TechnicianToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  token: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(
    () => Technician,
    (technician) => technician.token,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'technician_id' })
  technician: Technician;
}
