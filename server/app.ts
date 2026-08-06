/**
 * Express application factory.
 *
 * Exported separately from `server.ts` so tests can build the app without
 * binding a network port or starting Vite.
 */
import express, { type Express } from 'express';
import cookieParser from 'cookie-parser';
import { corsMiddleware, createRateLimiter, securityHeaders } from './middleware';
import { createApiRouter } from './routes';

export function createApp(): Express {
  const app = express();

  app.use(securityHeaders);
  app.use(corsMiddleware);
  app.use(cookieParser());

  // Body size limits.
  app.use(express.json({ limit: '100kb' }));
  app.use('/api/scan-meal', express.json({ limit: '5mb' }));
  app.use('/api/generate-workout', express.json({ limit: '1mb' }));
  app.use('/api/refine-workout', express.json({ limit: '1mb' }));

  app.use(
    createRateLimiter({
      windowMs: 60_000,
      max: 120,
      keyPrefix: 'global',
      message: 'Too many requests globally, slow down.',
    }),
  );

  app.use('/api', createApiRouter());

  // Global error handler.
  app.use(
    (
      err: { type?: string },
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      if (err?.type === 'entity.too.large') {
        res.status(413).json({ error: 'Payload too large' });
        return;
      }
      console.error('Unhandled error:', err);
      res.status(500).json({ error: 'Internal server error' });
    },
  );

  return app;
}
