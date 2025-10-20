import { plainToInstance, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  APP_NAME?: string;

  @IsOptional()
  @Type(() => Number)
  APP_PORT?: number;

  @IsNotEmpty()
  DATABASE_URL: string;

  @IsOptional()
  NODE_ENV?: string;

  @IsNotEmpty()
  ACCESS_TOKEN: string;
  @IsNotEmpty()
  REFRESH_TOKEN: string;
  @IsNotEmpty()
  ACCESS_TOKEN_EXPIRES_IN: string;
  @IsNotEmpty()
  REFRESH_TOKEN_EXPIRES_IN: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
