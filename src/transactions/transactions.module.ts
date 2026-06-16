import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule { }
