import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyClient } from './entities/company-client.entity';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { CompanyClientController } from './company-client.controller';
import { CompanyClientService } from './company-client.service';
import { TokensModule } from 'src/common/tokens/token.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { ReviewsModule } from 'src/reviews/reviews.module';
import { AddressModule } from 'src/address/address.module';
import { OrderModule } from 'src/order/order.module';
import { PricingModule } from 'src/pricing/pricing.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
    imports: [TypeOrmModule.forFeature([CompanyClient]),
        BaseUserModule, VerificationCodeModule, TokensModule, NotificationsModule, ReviewsModule, AddressModule, OrderModule, PricingModule, TransactionsModule],
    controllers: [CompanyClientController],
    providers: [CompanyClientService],
    exports: [CompanyClientService, TypeOrmModule],
})
export class CompanyClientModule { }
