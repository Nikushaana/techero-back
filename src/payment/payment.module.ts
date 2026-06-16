import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Order } from 'src/order/entities/order.entity';
import { InvoiceModule } from 'src/invoice/invoice.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Transaction]), NotificationsModule, InvoiceModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
