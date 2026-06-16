import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { BranchesModule } from 'src/branches/branches.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { Address } from 'src/address/entities/address.entity';
import { Category } from 'src/category/entities/category.entity';
import { PricingModule } from 'src/pricing/pricing.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { PaymentModule } from 'src/payment/payment.module';
import { InvoiceModule } from 'src/invoice/invoice.module';
import { UploadsModule } from 'src/common/uploads/uploads.module';

@Module({
    imports: [TypeOrmModule.forFeature([Order, Technician, Delivery, Address, Category]), BaseUserModule, BranchesModule, NotificationsModule, PricingModule, TransactionsModule, PaymentModule, InvoiceModule, UploadsModule],
    providers: [OrderService],
    exports: [OrderService, TypeOrmModule],
})
export class OrderModule { }