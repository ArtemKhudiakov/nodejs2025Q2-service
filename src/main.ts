import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import * as swaggerUi from 'swagger-ui-express';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const yamlFilePath = path.join(process.cwd(), 'doc', 'api.yaml');
  const yamlContent = fs.readFileSync(yamlFilePath, 'utf8');
  const swaggerDocument = yaml.load(yamlContent) as any;

  app.use('/doc', ...swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  const port = process.env.PORT || 4000;
  await app.listen(port);
}
bootstrap();
