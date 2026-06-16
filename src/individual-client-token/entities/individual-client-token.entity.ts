import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('individual_client_tokens')
export class IndividualClientToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  token: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @OneToOne(
    () => IndividualClient,
    (individualClient) => individualClient.token,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'individual_client_id' })
  individualClient: IndividualClient;
}
