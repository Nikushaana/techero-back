import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from './address.service';
import { Address } from './entities/address.entity';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { Branch } from 'src/branches/entities/branches.entity';
import { Order } from 'src/order/entities/order.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Address, Branch, Order]), BaseUserModule],
    providers: [AddressService],
    exports: [AddressService, TypeOrmModule],
})
export class AddressModule { }
