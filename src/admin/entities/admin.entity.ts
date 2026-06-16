import { Exclude, Expose } from 'class-transformer';
import { AdminToken } from 'src/admin-token/entities/admin-token.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true },)
  phone: string;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Expose()
  get role(): string {
    return "admin";
  }

  @Exclude()
  @Column()
  password: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => AdminToken, (token) => token.admin)
  token: AdminToken;
}
