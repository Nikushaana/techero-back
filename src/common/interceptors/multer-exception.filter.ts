import { ExceptionFilter, Catch, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { MulterError } from 'multer';
import { Response } from 'express';

@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.code === 'LIMIT_FILE_SIZE') {
      response.status(400).json({
        statusCode: 400,
        message: 'ფაილი ძალიან დიდია! მაქსიმალური ზომაა 30 MB.',
      });
    } else {
      response.status(400).json({
        statusCode: 400,
        message: exception.message,
      });
    }
  }
}