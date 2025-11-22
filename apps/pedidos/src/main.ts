import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app/app.module';
import fastifyCors from '@fastify/cors'; // 👈 Importa el plugin
import { setupSwagger } from '@medi-supply/shared';

async function bootstrap() {
  // 🔹 Creamos la app con FastifyAdapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  // 🌍 Habilitar CORS con Fastify
  await app.register(fastifyCors, {
    origin: [
      'https://medisupply-474900.web.app', // frontend en Firebase
      'https://medi-g8-b0kxqvrx.ue.gateway.dev', // API Gateway
      'http://localhost:4200', // opcional para desarrollo local
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // si manejas cookies o headers auth
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // convierte y construye el DTO desde query/body
      whitelist: true, // opcional: borra props no definidas en DTO
      forbidNonWhitelisted: false, // true lanza 400 si vienen props extra
      transformOptions: { enableImplicitConversion: true }, // convierte tipos implícitamente
    })
  );

  // 🔹 Prefijo global
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // 🔹 Puerto configurable
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  setupSwagger(app, 'API Pedidos', 'Módulo de gestión de pedidos');

  // 🔹 Escuchar en 0.0.0.0 (útil para Cloud Run o Docker)
  await app.listen({ port, host: '0.0.0.0' });

  // 🔹 Logging
  Logger.log(
    `🚀 Application is running on: ${await app.getUrl()}/${globalPrefix}`
  );
}

bootstrap();
