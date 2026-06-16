import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseUserService } from './base-user.service';
import { VerificationCode } from 'src/verification-code/entities/verification-code.entity';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { Admin } from 'src/admin/entities/admin.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { UploadsModule } from 'src/common/uploads/uploads.module';

@Module({
    imports: [TypeOrmModule.forFeature([VerificationCode, IndividualClient, CompanyClient, Technician, Delivery, Admin]), VerificationCodeModule, NotificationsModule, UploadsModule],
    providers: [BaseUserService],
    exports: [BaseUserService],
})
export class BaseUserModule { }