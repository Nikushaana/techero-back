import { Exclude, Expose } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CompanyClientToken } from 'src/company-client-token/entities/company-client-token.entity';
import { Order } from 'src/order/entities/order.entity';
import { Address } from 'src/address/entities/address.entity';
import { Review } from 'src/reviews/entities/review.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';

@Entity('company_clients')
export class CompanyClient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  phone: string;

  @Column()
  companyAgentName: string;

  @Column()
  companyAgentLastName: string;

  @Column()
  companyName: string;

  @Column()
  companyIdentificationCode: string;

  @Column("simple-array", { default: "" })
  images: string[];

  @Exclude()
  @Column("simple-json", { default: () => "'{\"mobile\":0,\"desktop\":0}'" })
  used_devices: { mobile: number; desktop: number };

  @Column({ default: 'company' })
  role: string;

  @Column({ default: false })
  status: boolean;

  @Exclude()
  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Order, (order) => order.company)
  orders: Order[];

  @OneToMany(() => Address, (address) => address.company)
  addresses: Address[];

  @OneToMany(() => Review, (review) => review.company)
  reviews: Review[];

  @OneToMany(() => Transaction, (transaction) => transaction.company)
  transactions: Transaction[];

  @OneToOne(() => CompanyClientToken, (token) => token.companyClient)
  token: CompanyClientToken;
}
