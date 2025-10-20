import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { setGlobalLogger } from './common/decorators/log-method.decorator';
import { LoggerService } from './common/logger/logger.service';
import { configuration } from './configs/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints?.[Object.keys(error.constraints)[0]],
        }));
        return new BadRequestException({ errors: result });
      },
      stopAtFirstError: true,
    }),
  );
  app.setGlobalPrefix('api');
  const logger = app.get(LoggerService);

  setGlobalLogger(logger);
  const config = new DocumentBuilder()
    .setTitle(configuration.app.name)
    .setDescription('The practice project API description')
    .setVersion('1.0')
    .addTag('practice')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
