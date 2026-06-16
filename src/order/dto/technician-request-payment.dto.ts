import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPositive, IsString, MaxLength } from 'class-validator';

export class TechnicianRequestPaymentDto {
    @Type(() => Number)
    @IsNumber({ maxDecimalPlaces: 2 })
    @IsPositive()
    payment_amount: number;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    payment_reason: string;
}
