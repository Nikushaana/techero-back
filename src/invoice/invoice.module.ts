import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoicesController } from './invoice.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice]),
  ],
  controllers: [InvoicesController],
  providers: [InvoiceService],
  exports: [InvoiceService],
})
export class InvoiceModule { } 
