// src/serverless.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';

const server = express();

async function bootstrap() {
  // Create the Nest application using an Express adapter
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  
  // Use global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS. For production, consider using an environment variable for the allowed origin.
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Initialize the app without listening on a port.
  await app.init();
}
bootstrap();

export default server;
