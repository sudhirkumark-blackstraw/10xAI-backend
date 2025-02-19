// src/serverless.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

const server = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.init();

  // If running locally, start listening on a port
  if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3005;
    server.listen(port, () => {
      console.log(`Server running locally on port ${port}`);
    });
  }
}
bootstrap();

export default server;
