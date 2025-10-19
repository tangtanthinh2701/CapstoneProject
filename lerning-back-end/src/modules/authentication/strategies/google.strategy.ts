import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { ERROR_MESSAGES } from 'src/common/constants/messages.constants';
import { UserService } from 'src/modules/user/user.service';

import { LoginDto } from '../dto/login.dto';
import { GOOGLE_OAUTH_CLIENT } from '../providers/google-oauth.provider';
import { AuthProviderType } from '../types/auth-provider.type';
import { LoginStrategy } from '../types/login-strategy.interface';

@Injectable()
export class GoogleStrategy implements LoginStrategy {
  constructor(
    @Inject(GOOGLE_OAUTH_CLIENT)
    private readonly oauthClient: OAuth2Client,
    private userService: UserService,
  ) {}
  async validate(dto: LoginDto) {
    if (!dto.token) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTHENTICATION.NOT_FOUND_GOOGLE_TOKEN,
      );
    }
    const ticket = await this.oauthClient.verifyIdToken({
      idToken: dto.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload?.sub) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTHENTICATION.INVALID_GOOGLE_TOKEN,
      );
    }
    if (!payload.email) {
      throw new BadRequestException(
        ERROR_MESSAGES.AUTHENTICATION.EMAIL_NOT_EXISTED,
      );
    }
    const user = await this.userService.findByProvider({
      provider: AuthProviderType.facebook,
      providerUserId: payload.sub,
    });
    if (!user) {
      const createdUser = await this.userService.createUser({
        email: payload.email,
        name: payload.name ?? '',
        avatar: payload.picture ?? null,
        provider: dto.provider,
        providerUserId: payload.sub,
        passwordHash: null,
      });
      return createdUser;
    }
    return user;
  }
}
