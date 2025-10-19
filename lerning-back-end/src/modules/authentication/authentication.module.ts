import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';

import { UserModule } from '../user/user.module';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { LoginStrategyFactory } from './factory/login-strategy.factory';
import { GoogleOAuthProvider } from './providers/google-oauth.provider';
import { FacebookService } from './services/facebook/facebook.service';
import { GoogleService } from './services/google/google.service';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [DatabaseModule, JwtModule, UserModule, HttpModule],
  controllers: [AuthenticationController],
  providers: [
    GoogleOAuthProvider,
    AuthenticationService,
    LoginStrategyFactory,
    LocalStrategy,
    FacebookStrategy,
    GoogleStrategy,
    GoogleService,
    FacebookService,
  ],
})
export class AuthenticationModule {}
