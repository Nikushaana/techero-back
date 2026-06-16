import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/common/types/order-status.enum';
import { OrderType } from 'src/common/types/order-type.enum';
import { TransactionStatus } from 'src/common/types/transaction-status.enum';
import { InvoiceService } from 'src/invoice/invoice.service';
import { NotificationFor, NotificationType } from 'src/notifications/entities/notification.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Order } from 'src/order/entities/order.entity';
import { Transaction } from 'src/transactions/entities/transaction.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,

        @InjectRepository(Transaction)
        private readonly transactionRepo: Repository<Transaction>,

        private readonly notificationService: NotificationsService,

        private readonly invoiceService: InvoiceService,
    ) { }

    async mockPayOrder(transactionId: number, invoiceId: number) {
        const transaction = await this.transactionRepo.findOne({ where: { id: transactionId }, relations: ['order'] });

        if (!transaction?.order) {
            throw new BadRequestException('Transaction has no linked order');
        }

        const order = await this.orderRepo.findOne({
            where: { id: transaction.order.id },
            relations: ['company', 'individual', 'technician'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Update order status
        if (order.status === OrderStatus.PENDING_CREATION_PAYMENT) {
            order.status = OrderStatus.PROCESSING;
        } else if (order.status === OrderStatus.PENDING_REPAIRING_OFF_SITE_PAYMENT) {
            order.status = OrderStatus.REPAIRING_OFF_SITE;
        } else if (order.status === OrderStatus.PENDING_ON_SITE_PAYMENT) {
            order.status =
                order.service_type === OrderType.INSTALLATION
                    ? OrderStatus.COMPLETED_ON_SITE_INSTALLING
                    : OrderStatus.COMPLETED_ON_SITE_REPAIRING;
        }

        await this.orderRepo.save(order);

        // Update transaction status
        transaction.status = TransactionStatus.PAID;
        await this.transactionRepo.save(transaction);

        // Update invoice
        await this.invoiceService.markAsPaidById(invoiceId);

        const user = order.company || order.individual;

        // send notification to admin
        await this.notificationService.sendNotification(
            `შეკვეთა №${order.id}: ${order.status === OrderStatus.PROCESSING ? "წინასწარი გადახდა შესრულდა, ახლა გრძელდება შეკვეთის დამუშავება." :
                order.status === OrderStatus.REPAIRING_OFF_SITE ? "გადახდა შესრულდა, სერვისი მიმდინარეობს სერვისცენტრში." :
                    "გადახდა შესრულდა, სერვისი ადგილზე დასრულდა."}`,
            NotificationType.ORDER_UPDATED,
            'admin',
            undefined,
            { order_id: order.id },
        );

        // send notification to user
        await this.notificationService.sendNotification(
            `შეკვეთა №${order.id}: ${order.status === OrderStatus.PROCESSING ? "წინასწარი გადახდა შესრულდა, ახლა გრძელდება შეკვეთის დამუშავება." :
                order.status === OrderStatus.REPAIRING_OFF_SITE ? "გადახდა შესრულდა, სერვისი მიმდინარეობს სერვისცენტრში." :
                    "გადახდა შესრულდა, სერვისი ადგილზე დასრულდა."}`,
            NotificationType.ORDER_UPDATED,
            user.role as NotificationFor,
            user.id,
            { order_id: order.id },
        );

        {
            order.status === OrderStatus.REPAIRING_OFF_SITE &&
                // send notification to technician
                await this.notificationService.sendNotification(
                    `შეკვეთა №${order.id}: გადახდა შესრულდა, სერვისი მიმდინარეობს სერვისცენტრში.`,
                    NotificationType.ORDER_UPDATED,
                    "technician",
                    order.technician?.id,
                    { order_id: order.id },
                );
        }

        return {
            success: true,
            message: 'Payment successful',
            orderId: order.id,
        };
    }

}
