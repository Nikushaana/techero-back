import { Exclude } from 'class-transformer';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

class Location {
    lat: number;
    lng: number;
}

@Entity('branches')
export class Branch {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    street: string;

    @Column()
    building_number: string;

    @Column()
    description: string;

    @Column({ type: 'json' })
    location: Location;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    coverage_radius_km: number;

    @Exclude()
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    fix_off_site_price: number;

    @Exclude()
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    installation_price: number;

    @Exclude()
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    fix_on_site_price: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
