import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ERROR_MESSAGES } from 'src/common/constants/messages.constants';
import { UserService } from 'src/modules/user/user.service';

import { LoginDto } from '../dto/login.dto';
import { FacebookService } from '../services/facebook/facebook.service';
import { LoginStrategy } from '../types/login-strategy.interface';

@Injectable()
export class FacebookStrategy implements LoginStrategy {
  constructor(
    private userService: UserService,
    private facebookService: FacebookService,
  ) {}
  async validate(dto: LoginDto) {
    if (!dto.token) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTHENTICATION.NOT_FOUND_FACBOOK_TOKEN,
      );
    }
    const fbProfile = await this.facebookService.getFacebookProfile(dto.token);
    if (!fbProfile) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTHENTICATION.INVALID_FACEBOOK_TOKEN,
      );
    }
    if (!fbProfile.email) {
      throw new BadRequestException(
        ERROR_MESSAGES.AUTHENTICATION.EMAIL_NOT_EXISTED,
      );
    }
    const user = await this.userService.findByProvider({
      provider: dto.provider,
      providerUserId: fbProfile.id,
    });
    if (!user) {
      const createdUser = await this.userService.createUser({
        email: fbProfile.email,
        name: fbProfile.name,
        avatar: fbProfile.picture?.data.url ?? null,
        provider: dto.provider,
        providerUserId: fbProfile.id,
        passwordHash: null,
      });
      return createdUser;
    }
    return user;
  }
}
