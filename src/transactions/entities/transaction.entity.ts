import { Transform } from 'class-transformer';
import { PaymentProvider } from 'src/common/types/payment-provider.enum';
import { TransactionStatus } from 'src/common/types/transaction-status.enum';
import { TransactionType } from 'src/common/types/transaction-type.enum';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { Order } from 'src/order/entities/order.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0
  })
  amount: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus, default: 'pending' })
  status: TransactionStatus;

  @Column()
  reason: string;

  @Column({ type: 'enum', enum: PaymentProvider, nullable: true })
  provider: PaymentProvider;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => IndividualClient, (individual) => individual.transactions, { nullable: true })
  individual: IndividualClient;

  @ManyToOne(() => CompanyClient, (company) => company.transactions, { nullable: true })
  company: CompanyClient;

  @ManyToOne(() => Order, { nullable: true })
  order: Order;

}
