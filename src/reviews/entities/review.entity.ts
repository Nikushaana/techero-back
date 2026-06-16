import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('reviews')
export class Review {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    review: string;

    @Column({ type: 'int' })
    stars: number;

    @Column({ default: false })
    status: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => IndividualClient, (individual) => individual.reviews, { nullable: true })
    individual: IndividualClient;

    @ManyToOne(() => CompanyClient, (company) => company.reviews, { nullable: true })
    company: CompanyClient;
}
