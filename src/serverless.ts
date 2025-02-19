// src/serverless.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';

const server = express();

// Create a promise for bootstrapping the Nest app
const bootstrapPromise = (async () => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.init();
})();

// Export a handler function that waits for bootstrap to finish
export default async (req, res) => {
  await bootstrapPromise;
  // Delegate the request to the Express server
  server(req, res);
};
