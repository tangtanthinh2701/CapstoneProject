import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import { BadRequestExceptionFilter } from './common/filters/bad-request-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-request-exception.filter';
import { LoggerInterceptor } from './common/interceptors/logger.interceptor';
import { LoggerModule } from './common/logger/logger.module';
import { validate } from './configs/environment-variables.config';
import { DatabaseModule } from './database/database.module';
import { AuthenticationModule } from './modules/authentication/authentication.module';
import { JwtGuard } from './modules/authentication/guards/jwt.guard';
import { ResponseInterceptor } from './modules/authentication/interceptors/response.interceptor';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    DatabaseModule,
    AuthenticationModule,
    UserModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: BadRequestExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
