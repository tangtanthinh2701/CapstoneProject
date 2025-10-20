import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { ERROR_MESSAGES } from 'src/common/constants/messages.constants';
import { LogMethod } from 'src/common/decorators/log-method.decorator';
import { configuration } from 'src/configs/configuration';

import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { PublicUserDto } from './dto/public-user.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginStrategyFactory } from './factory/login-strategy.factory';
import { AuthProviderType } from './types/auth-provider.type';
import { hashPassword } from './utils/hash-password';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private loginStrategyFactory: LoginStrategyFactory,
    private jwtService: JwtService,
  ) {}
  @LogMethod()
  async login(loginDto: LoginDto) {
    const loginStrategy = this.loginStrategyFactory.getStrategy(
      loginDto.provider,
    );
    const user = await loginStrategy.validate(loginDto);
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload, {
        privateKey: configuration.authentication.accessToken,
        expiresIn: configuration.authentication.accessTokenExpiresIn,
      }),
      refresh_token: this.jwtService.sign(payload, {
        secret: configuration.authentication.refreshToken,
        expiresIn: configuration.authentication.refreshTokenExpiresIn,
      }),
      user: plainToInstance(PublicUserDto, user, {
        excludeExtraneousValues: true,
      }),
    };
  }
  @LogMethod()
  async signUp(signUpDto: SignUpDto) {
    const foundUser = await this.userService.findOneByEmail({
      email: signUpDto.email,
    });
    if (foundUser) {
      throw new BadRequestException(ERROR_MESSAGES.USER.EMAIL_ALREADY_EXISTED);
    }
    const passwordHash = await hashPassword(signUpDto.password);
    const createdUser = await this.userService.createUser({
      name: signUpDto.name,
      email: signUpDto.email,
      avatar: null,
      provider: AuthProviderType.local,
      providerUserId: null,
      passwordHash,
    });
    return plainToInstance(PublicUserDto, createdUser, {
      excludeExtraneousValues: true,
    });
  }
}
