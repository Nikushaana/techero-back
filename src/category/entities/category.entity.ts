import { Order } from 'src/order/entities/order.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @OneToMany(() => Order, (order) => order.category)
    orders: Order[];

    @Column({ default: false })
    status: boolean;

    @Column("simple-array", { default: "" })
    images: string[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
