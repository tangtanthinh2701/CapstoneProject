import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { compare } from 'bcrypt';
import { ERROR_MESSAGES } from 'src/common/constants/messages.constants';
import { DatabaseService } from 'src/database/database.service';

import { LoginDto } from '../dto/login.dto';
import { LoginStrategy } from '../types/login-strategy.interface';

@Injectable()
export class LocalStrategy implements LoginStrategy {
  constructor(private databaseService: DatabaseService) {}

  async validate(dto: LoginDto): Promise<User> {
    const user = await this.databaseService.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !dto.password || !user.passwordHash) {
      throw new UnauthorizedException(ERROR_MESSAGES.USER.USER_NOT_FOUND);
    }

    const isMatch = await compare(dto.password, user.passwordHash);

    if (!isMatch) {
      throw new UnauthorizedException(
        ERROR_MESSAGES.AUTHENTICATION.INVALID_EMAIL_OR_PASSWORD,
      );
    }

    return user;
  }
}
