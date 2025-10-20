import { User } from '@prisma/client';

import { LoginDto } from '../dto/login.dto';

export interface LoginStrategy {
  validate(dto: LoginDto): Promise<User>;
}
