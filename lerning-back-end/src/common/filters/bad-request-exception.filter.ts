import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { format } from 'date-fns';
import { LoggerService } from 'src/common/logger/logger.service'; // Adjust path as needed

@Catch(BadRequestException)
export class BadRequestExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const responseBody = exception.getResponse();

    let message = exception.message;
    let errors = null;

    if (typeof responseBody === 'object' && responseBody !== null) {
      const body = responseBody as any;
      if (body.message) {
        message = body.message;
      }
      if (body.errors) {
        errors = body.errors;
      }
    }

    const formattedError = {
      status: false,
      statusCode: status,
      path: request.url,
      message,
      data: null,
      errors,
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    };

    this.logger.error(
      `[${request.method}] ${request.url}`,
      JSON.stringify(formattedError),
    );

    response.status(status).json(formattedError);
  }
}
