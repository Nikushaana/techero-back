import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { TransactionType } from 'src/common/types/transaction-type.enum';
import { PaymentProvider } from 'src/common/types/payment-provider.enum';

export class CreateTransactionDto {
    @IsNumber()
    amount: number;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsNotEmpty()
    reason: string;

    @IsEnum(PaymentProvider)
    @IsOptional()
    provider?: PaymentProvider;

    @IsOptional()
    individualId?: number;

    @IsOptional()
    companyId?: number;

    @IsOptional()
    orderId?: number;
}
