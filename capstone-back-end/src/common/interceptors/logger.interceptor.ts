import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { Observable, tap } from 'rxjs';

import { LoggerService } from '../logger/logger.service';
import { omit } from '../utils/omit';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<ExpressRequest>();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { method, originalUrl, ip, body } = req;
    const start = Date.now();
    const safeBody = omit(body, ['password', 'confirmPassword', 'token']);
    this.logger.log(
      `Incoming Request: ${method} ${originalUrl} from ${ip} body : ${JSON.stringify(safeBody)}`,
      'HTTP',
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(
          `Response: ${method} ${originalUrl} - ${duration}ms`,
          'HTTP',
        );
      }),
    );
  }
}
