import { Exclude, Expose } from 'class-transformer';
import { DeliveryToken } from 'src/delivery-token/entities/delivery-token.entity';
import { Order } from 'src/order/entities/order.entity';
import { TechnicianToken } from 'src/technician-token/entities/technician-token.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('deliveries')
export class Delivery {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    phone: string;

    @Column()
    name: string;

    @Column()
    lastName: string;

    @Column("simple-array", { default: "" })
    images: string[];

    @Column({ default: 'delivery' })
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

    @OneToMany(() => Order, (order) => order.delivery)
    orders: Order[];

    @OneToOne(() => DeliveryToken, (token) => token.delivery)
    token: DeliveryToken;
}
