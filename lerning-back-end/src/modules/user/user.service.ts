import { Injectable } from '@nestjs/common';
import { LogMethod } from 'src/common/decorators/log-method.decorator';
import { DatabaseService } from 'src/database/database.service';

import { CreateUserDto } from './dto/create-user.dto';
import { FindEmailUserDto } from './dto/find-email-user.dto';
import { FindProviderUserDto } from './dto/find-provider-user.dto';

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}
  @LogMethod()
  async findByProvider(findProviderUserDto: FindProviderUserDto) {
    const user = await this.databaseService.user.findUnique({
      where: {
        provider_providerUserId: {
          provider: findProviderUserDto.provider,
          providerUserId: findProviderUserDto.providerUserId,
        },
      },
    });
    return user;
  }
  @LogMethod()
  async createUser(createUserDto: CreateUserDto) {
    const user = await this.databaseService.user.create({
      data: {
        ...createUserDto,
      },
    });
    return user;
  }
  @LogMethod()
  async findOneByEmail(findEmailUserDto: FindEmailUserDto) {
    const user = await this.databaseService.user.findUnique({
      where: {
        email: findEmailUserDto.email,
      },
    });
    return user;
  }
}
