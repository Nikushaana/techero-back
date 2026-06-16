import { Module } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from './entities/technician.entity';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { BaseUserModule } from 'src/common/services/base-user/base-user.module';
import { TokensModule } from 'src/common/tokens/token.module';
import { OrderModule } from 'src/order/order.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Technician]),
    BaseUserModule, VerificationCodeModule, TokensModule, OrderModule, NotificationsModule
  ],
  providers: [TechnicianService],
  controllers: [TechnicianController],
  exports: [TechnicianService, TypeOrmModule],
})
export class TechnicianModule { }
