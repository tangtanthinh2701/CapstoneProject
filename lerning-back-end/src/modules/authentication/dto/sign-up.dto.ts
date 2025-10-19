import { IsEmail, IsString, MinLength } from 'class-validator';
import { Match } from 'src/common/decorators/match.decorator';

export class SignUpDto {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;

  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;

  @IsString()
  name: string;
}
