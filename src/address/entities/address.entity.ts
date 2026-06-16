import { Branch } from "src/branches/entities/branches.entity";
import { CompanyClient } from "src/company-client/entities/company-client.entity";
import { IndividualClient } from "src/individual-client/entities/individual-client.entity";
import { Order } from "src/order/entities/order.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

class Location {
    lat: number;
    lng: number;
}

@Entity('addresses')
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    building_number: string;

    @Column()
    street: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'json' })
    location: Location;
    
    @ManyToOne(() => Branch, { nullable: false })
    branch: Branch;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => IndividualClient, (individual) => individual.addresses, { nullable: true })
    individual: IndividualClient;

    @ManyToOne(() => CompanyClient, (company) => company.addresses, { nullable: true })
    company: CompanyClient;

    @OneToMany(() => Order, (order) => order.address)
    orders: Order[];
}
