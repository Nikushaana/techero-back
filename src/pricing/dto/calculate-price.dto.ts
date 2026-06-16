import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { OrderType } from 'src/common/types/order-type.enum';

export class CalculatePriceDto {
    @IsNumber()
    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    addressId: number;

    @IsEnum(OrderType)
    service_type: OrderType;
}
