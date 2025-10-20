import { AuthProviderType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class FindProviderUserDto {
  @IsEnum(AuthProviderType)
  provider: AuthProviderType;
  providerUserId: string;
}
