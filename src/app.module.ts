import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CompanyClientModule } from './company-client/company-client.module';
import { FrontModule } from './front/front.module';
import { IndividualClientModule } from './individual-client/individual-client.module';
import { TechnicianModule } from './technician/technician.module';
import { DeliveryModule } from './delivery/delivery.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { BranchesModule } from './branches/branches.module';
import { AddressModule } from './address/address.module';
import { OrderModule } from './order/order.module';
import { CategoryModule } from './category/category.module';
import { FaqModule } from './faq/faq.module';
import { PricingModule } from './pricing/pricing.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentModule } from './payment/payment.module';
import { StreetsModule } from './streets/streets.module';
import { InvoiceModule } from './invoice/invoice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),

    AdminModule,

    AuthModule,

    IndividualClientModule,

    CompanyClientModule,

    FrontModule,

    TechnicianModule,

    DeliveryModule,

    NotificationsModule,

    ReviewsModule,

    BranchesModule,

    AddressModule,

    OrderModule,

    CategoryModule,

    FaqModule,

    PricingModule,

    TransactionsModule,

    PaymentModule,

    StreetsModule,

    InvoiceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
