import express from 'express';
import { errorHandler } from '@middleware/error.middleware';
import { gatewayRoutes } from '@modules/gateway';

export function createApp() {
  const app = express();

  // Middleware
  app.use(express.json());

  // Routes
  app.use('/api', gatewayRoutes);

  // Error handling
  app.use(errorHandler);

  return app;
}
