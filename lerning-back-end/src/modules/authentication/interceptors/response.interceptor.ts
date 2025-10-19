import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { format } from 'date-fns';
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LoggerService } from 'src/common/logger/logger.service';

import { RESPONSE_MESSAGE_METADATA } from '../decorators/response-message.decorator';

export type Response<T> = {
  status: boolean;
  statusCode: number;
  path: string;
  message: string;
  data: T;
  timestamp: string;
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: LoggerService,
  ) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next
      .handle()
      .pipe(map((res: T) => this.responseHandler(res, context)));
  }

  responseHandler(res: T, context: ExecutionContext) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse<ExpressResponse>();
    const request = ctx.getRequest<ExpressRequest>();
    const statusCode = response.statusCode;
    const message =
      this.reflector.get<string>(
        RESPONSE_MESSAGE_METADATA,
        context.getHandler(),
      ) || 'success';
    const successResponse = {
      status: true,
      path: request.url,
      message,
      statusCode,
      data: res,
      timestamp: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss'),
    };
    this.logger.log(
      `[${request.method}] ${request.url}`,
      JSON.stringify(successResponse),
    );
    return { ...successResponse };
  }
}
