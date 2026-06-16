import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminToken } from "src/admin-token/entities/admin-token.entity";
import { CompanyClientToken } from "src/company-client-token/entities/company-client-token.entity";
import { DeliveryToken } from "src/delivery-token/entities/delivery-token.entity";
import { IndividualClientToken } from "src/individual-client-token/entities/individual-client-token.entity";
import { TechnicianToken } from "src/technician-token/entities/technician-token.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AdminToken,
            IndividualClientToken,
            CompanyClientToken,
            TechnicianToken,
            DeliveryToken,
        ]),
    ],
    exports: [
        TypeOrmModule,
    ],
})
export class TokensModule { }