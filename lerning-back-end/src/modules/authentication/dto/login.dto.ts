import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

import { ERROR_MESSAGES } from '../../../common/constants/messages.constants';
import { AuthProviderType } from '../types/auth-provider.type';

export class LoginDto {
  @IsEnum(AuthProviderType)
  provider: AuthProviderType;

  @ValidateIf((o: LoginDto) => o.provider === AuthProviderType.local)
  @IsEmail()
  email?: string;

  @ValidateIf((o: LoginDto) => o.provider === AuthProviderType.local)
  @IsString()
  @MinLength(6)
  password?: string;

  @ValidateIf((o: LoginDto) => o.provider !== AuthProviderType.local, {
    message: ERROR_MESSAGES.AUTHENTICATION.NOT_FOUND_FACBOOK_TOKEN,
  })
  @IsString()
  token?: string;
}
