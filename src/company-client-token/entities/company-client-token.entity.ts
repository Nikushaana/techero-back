import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('company_client_tokens')
export class CompanyClientToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  token: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(() => CompanyClient, (companyClient) => companyClient.token, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'company_client_id' })
  companyClient: CompanyClient;
}
