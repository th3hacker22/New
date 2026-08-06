import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { corsMiddleware, securityHeaders } from './server/middleware';
import { createApiRouter } from './server/routes';
import { getAi } from './server/ai/client';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(securityHeaders);
app.use(corsMiddleware);
app.use(cookieParser());

// Body size limits: small by default, larger for image scan.
app.use(express.json({ limit: '100kb' }));
app.use('/api/scan-meal', express.json({ limit: '5mb' }));
app.use('/api/generate-workout', express.json({ limit: '1mb' }));
app.use('/api/refine-workout', express.json({ limit: '1mb' }));

// Global rate limit: 120 req / min / IP
import { createRateLimiter } from './server/middleware';
app.use(
  createRateLimiter({
    windowMs: 60_000,
    max: 120,
    keyPrefix: 'global',
    message: 'Too many requests globally, slow down.',
  }),
);

app.use('/api', createApiRouter());

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler (e.g. payload too large). The four-arg signature is
  // required by Express for error-handling middleware.
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

  app.listen(PORT, '0.0.0.0', () => {
    // eslint-disable-next-line no-console
    console.log(
      `Server running on http://localhost:${PORT} | Gemini: ${getAi() ? 'enabled' : 'disabled'}`,
    );
  });
}

startServer();
