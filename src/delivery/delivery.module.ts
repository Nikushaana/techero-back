import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delivery } from './entities/delivery.entity';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { TokensModule } from 'src/common/tokens/token.module';
import { OrderModule } from 'src/order/order.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Delivery]),
    BaseUserModule, VerificationCodeModule, TokensModule, OrderModule, NotificationsModule
  ],
  providers: [DeliveryService],
  controllers: [DeliveryController],
  exports: [DeliveryService, TypeOrmModule],
})
export class DeliveryModule { }
