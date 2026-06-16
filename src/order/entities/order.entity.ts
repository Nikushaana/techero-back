import { Address } from 'src/address/entities/address.entity';
import { Category } from 'src/category/entities/category.entity';
import { OrderStatus } from 'src/common/types/order-status.enum';
import { OrderType } from 'src/common/types/order-type.enum';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { Invoice } from 'src/invoice/entities/invoice.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: OrderType })
  service_type: OrderType;

  @Column("simple-array", { default: "" })
  images: string[];

  @Column("simple-array", { default: "" })
  videos: string[];

  @Column({ type: 'text', nullable: true })
  cancel_reason?: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0
  })
  payment_amount: number;

  @Column({ type: 'text', nullable: true })
  payment_reason?: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING_CREATION_PAYMENT })
  status: OrderStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Category, (category) => category.orders, { eager: true })
  category: Category;

  @ManyToOne(() => Address, (address) => address.orders, { eager: true })
  address: Address;

  @ManyToOne(() => CompanyClient, (company) => company.orders, { nullable: true })
  company: CompanyClient;

  @ManyToOne(() => IndividualClient, (individual) => individual.orders, { nullable: true })
  individual: IndividualClient;

  @ManyToOne(() => Technician, (technician) => technician.orders, { nullable: true })
  technician: Technician | null;

  @ManyToOne(() => Delivery, (delivery) => delivery.orders, { nullable: true })
  delivery: Delivery | null;

  @OneToMany(() => Invoice, (invoice) => invoice.order)
  invoices: Invoice[];
}
