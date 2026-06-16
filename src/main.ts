import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.100.7:3000', 'https://techero-iota.vercel.app', 'https://techero.ge'],
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

  await app.listen(port);

  console.log(`connected on port ` + port);

}
bootstrap();
