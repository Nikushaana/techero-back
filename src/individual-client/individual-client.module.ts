import { Module } from '@nestjs/common';
import { IndividualClientController } from './individual-client.controller';
import { IndividualClientService } from './individual-client.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndividualClient } from './entities/individual-client.entity';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { TokensModule } from 'src/common/tokens/token.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { AddressModule } from 'src/address/address.module';
import { OrderModule } from 'src/order/order.module';
import { PricingModule } from 'src/pricing/pricing.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([IndividualClient]),
    BaseUserModule, VerificationCodeModule, TokensModule, NotificationsModule, ReviewsModule, AddressModule, OrderModule, PricingModule, TransactionsModule
  ],
  controllers: [IndividualClientController],
  providers: [IndividualClientService],
  exports: [IndividualClientService, TypeOrmModule],
})
export class IndividualClientModule { }
