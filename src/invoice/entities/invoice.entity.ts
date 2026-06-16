import { Order } from 'src/order/entities/order.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export enum InvoiceType {
  CREATE_ORDER = 'CREATE_ORDER',
  REPAIR_ORDER = 'REPAIR_ORDER',
  SERVICE_ONSITE = 'SERVICE_ONSITE',
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  order_id: number;

  @ManyToOne(() => Order, (order) => order.invoices, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 'GEL' })
  currency: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @Column({ nullable: true })
  paid_at: Date;

  @Column({
    type: 'enum',
    enum: InvoiceType,
    default: InvoiceType.CREATE_ORDER,
  })
  type: InvoiceType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}