import { BadRequestException, Injectable } from '@nestjs/common';
import { ERROR_MESSAGES } from 'src/common/constants/messages.constants';
import { LogMethod } from 'src/common/decorators/log-method.decorator';

import { FacebookStrategy } from '../strategies/facebook.strategy';
import { GoogleStrategy } from '../strategies/google.strategy';
import { LocalStrategy } from '../strategies/local.strategy';
import { AuthProviderType } from '../types/auth-provider.type';

@Injectable()
export class LoginStrategyFactory {
  constructor(
    private local: LocalStrategy,
    private google: GoogleStrategy,
    private facebook: FacebookStrategy,
  ) {}
  @LogMethod()
  public getStrategy(provider: AuthProviderType) {
    switch (provider) {
      case AuthProviderType.facebook:
        return this.facebook;
      case AuthProviderType.google:
        return this.google;
      case AuthProviderType.local:
        return this.local;
      default:
        throw new BadRequestException(
          ERROR_MESSAGES.AUTHENTICATION.UNSUPPORTED_PROVIDER,
        );
    }
  }
}
