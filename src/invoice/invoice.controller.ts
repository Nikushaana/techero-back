import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { TokenValidationGuard } from '../auth/guards/token-validation.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { InvoiceService } from './invoice.service';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoiceService: InvoiceService) {}

  // @UseGuards(TokenValidationGuard, RolesGuard)
  // @Roles('admin', 'individual', 'company')
  // @Get(':id/download')
  // async downloadInvoice(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Res() res: Response,
  // ) {
  //   const { buffer, filename } =
  //     await this.invoiceService.generateInvoiceFile(id);

      
  //   res.set({
  //     'Content-Type': 'application/pdf',
  //     'Content-Disposition': `attachment; filename="${filename}"`,
  //     'Content-Length': buffer.length,
  //   });

  //   res.end(buffer);
  // }
}