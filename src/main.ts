import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // This tells NestJS to log errors to the console in detail
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.use(cookieParser());

  app.useStaticAssets('/app/data/uploads', {
    prefix: '/uploads/',
  });

  app.enableCors({
    origin: ['http://localhost:3000', 'https://techero.ge'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // remove properties not in DTO
      forbidNonWhitelisted: true, // throw error if unknown property is sent
      transform: true,            // auto-transform payloads (e.g. string -> number)
    }),
  );

  const port = process.env.PORT ?? 4000;

  await app.listen(port, '0.0.0.0');

  console.log(`connected on port ` + port);

}
bootstrap();
