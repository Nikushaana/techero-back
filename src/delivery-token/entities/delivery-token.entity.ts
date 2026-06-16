import { Delivery } from 'src/delivery/entities/delivery.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('delivery_tokens')
export class DeliveryToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  token: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(
    () => Delivery,
    (delivery) => delivery.token,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'delivery_id' })
  delivery: Delivery;
}
