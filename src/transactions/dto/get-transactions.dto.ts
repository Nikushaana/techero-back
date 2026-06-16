import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsEnum, IsString } from 'class-validator';
import { TransactionStatus } from 'src/common/types/transaction-status.enum';
import { TransactionType } from 'src/common/types/transaction-type.enum';

export class GetTransactionsDto {
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
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
