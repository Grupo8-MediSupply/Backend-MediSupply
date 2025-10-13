import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';

async function bootstrap() {
  // 🔹 Creamos la app con FastifyAdapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
  new ValidationPipe({
    transform: true, // convierte el body en instancias reales de DTOs
    whitelist: true, // elimina propiedades no declaradas en el DTO
    forbidNonWhitelisted: true, // lanza error si envían propiedades desconocidas
  }),
);

  // 🔹 Prefijo global
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // 🔹 Puerto configurable
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // 🔹 Escuchar en 0.0.0.0 (útil para Docker)
  await app.listen({ port, host: '0.0.0.0' });

  // 🔹 Logging
  Logger.log(
    `🚀 Application is running on: ${await app.getUrl()}/${globalPrefix}`,
  );
}

bootstrap();