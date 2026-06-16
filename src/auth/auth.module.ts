import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin } from 'src/admin/entities/admin.entity';
import { AdminToken } from 'src/admin-token/entities/admin-token.entity';
import { IndividualClient } from 'src/individual-client/entities/individual-client.entity';
import { IndividualClientToken } from 'src/individual-client-token/entities/individual-client-token.entity';
import { CompanyClient } from 'src/company-client/entities/company-client.entity';
import { CompanyClientToken } from 'src/company-client-token/entities/company-client-token.entity';
import { Technician } from 'src/technician/entities/technician.entity';
import { TechnicianToken } from 'src/technician-token/entities/technician-token.entity';
import { VerificationCode } from 'src/verification-code/entities/verification-code.entity';
import { VerificationCodeModule } from 'src/verification-code/verification-code.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AdminAuthController, AuthController, CompanyAuthController, DeliveryAuthController, IndividualAuthController, TechnicianAuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Delivery } from 'src/delivery/entities/delivery.entity';
import { DeliveryToken } from 'src/delivery-token/entities/delivery-token.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      AdminToken,
      IndividualClient,
      IndividualClientToken,
      CompanyClient,
      CompanyClientToken,
      Technician,
      TechnicianToken,
      Delivery,
      DeliveryToken,
      VerificationCode,
    ]),
    VerificationCodeModule,
    NotificationsModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController,
    AdminAuthController,
    IndividualAuthController,
    CompanyAuthController,
    TechnicianAuthController,
    DeliveryAuthController]
})
export class AuthModule { }
