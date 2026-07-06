import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { MulterError } from 'multer';

@Catch() // Catch ALL errors to debug
export class MulterExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MulterExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    
    // Log the error to your console so you can see the real cause
    this.logger.error(exception); 

    if (exception instanceof MulterError && exception.code === 'LIMIT_FILE_SIZE') {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: 'ფაილი ძალიან დიდია! მაქსიმალური ზომაა 30 MB.',
      });
    }

    // Fallback for other errors
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    response.status(status).json({
      statusCode: status,
      message: exception.message || 'Internal server error11',
    });
  }
}