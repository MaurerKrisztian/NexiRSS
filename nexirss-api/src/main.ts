import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT);
  console.log(
    `Application is running on port: ${process.env.PORT}, db: ${process.env.DB_URL}`,
  );
}
bootstrap();
