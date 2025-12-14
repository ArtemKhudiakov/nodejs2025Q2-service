import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { LoggingService } from './logging/logging.service';
import { HttpLoggingInterceptor } from './logging/http-logging.interceptor';
import { HttpExceptionFilter } from './common/exceptions/http-exception.filter';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as swaggerUi from 'swagger-ui-express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const loggingService = app.get(LoggingService);

  // Глобальные обработчики ошибок
  process.on('uncaughtException', (error: Error) => {
    loggingService.error(
      `Uncaught Exception: ${error.message}`,
      error.stack,
      'Process',
    );
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    loggingService.error(
      `Unhandled Rejection at ${promise}, reason: ${reason}`,
      reason?.stack,
      'Process',
    );
  });

  // Глобальная валидация
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Глобальный HTTP логирование
  app.useGlobalInterceptors(new HttpLoggingInterceptor(loggingService));

  // Глобальная обработка исключений
  app.useGlobalFilters(new HttpExceptionFilter(loggingService));

  const yamlFilePath = path.join(process.cwd(), 'doc', 'api.yaml');
  const yamlContent = fs.readFileSync(yamlFilePath, 'utf8');
  const swaggerDocument = yaml.load(yamlContent) as any;

  app.use('/doc', ...swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  const port = configService.get<number>('PORT') || 4000;
  await app.listen(port);
  loggingService.log(`Application is running on port ${port}`, 'Bootstrap');
}
bootstrap();
