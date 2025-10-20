import { Optional } from '@nestjs/common';
import { Expose } from 'class-transformer';

export class PublicUserDto {
  @Expose()
  id: string;

  @Expose()
  @Optional()
  name?: string;

  @Expose()
  email: string;

  @Expose()
  @Optional()
  avatar?: string;
}
