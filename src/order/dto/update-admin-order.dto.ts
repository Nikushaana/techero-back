import { IsEnum, IsNumber, IsOptional, ValidateIf } from 'class-validator';
import { OrderStatus } from 'src/common/types/order-status.enum';
import { OrderType } from 'src/common/types/order-type.enum';

export class UpdateAdminOrderDto {
    @IsOptional()
    @IsEnum(OrderType)
    service_type: OrderType;

    @IsNumber()
    technicianId: number;

    @ValidateIf((o) => o.service_type === OrderType.FIX_OFF_SITE)
    @IsNumber()
    deliveryId: number;

    @IsOptional()
    @IsEnum(OrderStatus)
    status: OrderStatus;
}
