import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { OrderType } from 'src/common/types/order-type.enum';

export class CreateOrderDto {
    @IsEnum(OrderType)
    service_type: OrderType;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    categoryId: number;

    @IsNumber()
    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    addressId: number;

    @IsString()
    @IsNotEmpty()
    brand: string;

    @IsString()
    @IsNotEmpty()
    model: string;

    @IsString()
    @IsNotEmpty()
    description: string;
}
