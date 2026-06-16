import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsEnum, IsString, IsDateString } from 'class-validator';
import { OrderStatus } from 'src/common/types/order-status.enum';
import { OrderType } from 'src/common/types/order-type.enum';

export class GetOrdersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(OrderType)
  service_type?: OrderType;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
